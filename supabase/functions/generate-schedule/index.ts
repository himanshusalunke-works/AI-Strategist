// @ts-nocheck - runs on Deno runtime (Supabase Edge Functions), not Node.js.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function authenticateRequest(req) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return { user: null, error: "Missing Authorization header" };

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: "Supabase auth environment is not configured" };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return { user: null, error: "Unauthorized" };
  return { user: data.user, error: null };
}

function normalizeSchedule(rawSchedule) {
  if (!rawSchedule || typeof rawSchedule !== "object" || Array.isArray(rawSchedule)) return null;

  const normalized = {};
  for (const [dayKey, dayItems] of Object.entries(rawSchedule)) {
    if (!Array.isArray(dayItems)) return null;

    const items = [];
    for (const item of dayItems) {
      if (!item || typeof item !== "object") return null;

      const topic = typeof item.topic === "string" ? item.topic.trim() : "";
      const reason = typeof item.reason === "string" ? item.reason.trim() : "";
      const duration = Number(item.duration);

      if (!topic || !reason || !Number.isFinite(duration) || duration <= 0) return null;

      items.push({
        topic,
        duration: Math.round(duration),
        reason,
      });
    }

    normalized[dayKey] = items;
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { error: authError } = await authenticateRequest(req);
    if (authError) {
      return jsonResponse({ error: authError }, 401);
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { topics, examDate, dailyHours } = body || {};

    if (!Array.isArray(topics) || topics.length === 0 || !examDate || dailyHours == null) {
      return jsonResponse({ error: "Missing required fields: topics, examDate, dailyHours" }, 400);
    }

    const examTime = new Date(examDate).getTime();
    const hoursNum = Number(dailyHours);
    if (!Number.isFinite(examTime)) {
      return jsonResponse({ error: "Invalid examDate" }, 400);
    }
    if (!Number.isFinite(hoursNum) || hoursNum <= 0 || hoursNum > 24) {
      return jsonResponse({ error: "Invalid dailyHours" }, 400);
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "GROQ_API_KEY secret not configured" }, 500);
    }

    const daysUntil = Math.max(
      1,
      Math.ceil((examTime - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const scheduleDays = Math.min(daysUntil, 7);

    const topicData = topics
      .map((t) => `- ${t.name}: mastery ${t.mastery_score}%`)
      .join("\n");

    const systemPrompt = `You are an expert study coach and subject matter tutor. Create a ${scheduleDays}-day study schedule for a student preparing for their exam in ${daysUntil} days.

Core rules:
- Student can study ${hoursNum} hours/day (${Math.round(hoursNum * 60)} minutes total per day)
- Prioritize weak topics (< 60% mastery) but don't ignore stronger ones
- Balance the workload - spread topics across days, don't dump everything on Day 1
- Give more time to topics with lowest mastery

CRITICAL - The "reason" field must be EDUCATIONAL and DAY-SPECIFIC:
- Each reason must be a UNIQUE, actionable study tip for THAT topic on THAT specific day
- Use day-progressive framing: Day 1 -> build foundations, Day 2 -> practice problems, Day 3 -> deepen understanding, Day 4+ -> application and edge cases
- Make it TOPIC-SPECIFIC: mention the actual concept, formula, or skill the student should work on TODAY
- End every reason with: "Key point: [one clear, concise fact or concept the student must be able to explain after this session]"
- NEVER repeat the same reason for the same topic on different days
- Keep each reason to 2 sentences maximum

Return EXACTLY this JSON structure:
{
  "Day 1": [
    {"topic": "Topic Name", "duration": 60, "reason": "Day 1 - Topic: ...study tip... Key point: ...concept..."}
  ]
}
Each day's total duration must not exceed ${Math.round(hoursNum * 60)} minutes.`;

    const userPrompt = `Study Data:\n${topicData}\n\nGenerate the JSON schedule.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return jsonResponse({ error: "Groq API call failed", detail: errText }, 502);
    }

    const groqData = await groqResponse.json();
    const text = groqData.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return jsonResponse({ error: "No valid JSON in Groq response" }, 502);
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return jsonResponse({ error: "Malformed JSON in Groq response" }, 502);
    }

    const schedule = normalizeSchedule(parsed);
    if (!schedule) {
      return jsonResponse({ error: "Invalid schedule format from Groq" }, 502);
    }

    return jsonResponse({ schedule }, 200);
  } catch (err) {
    console.error("Function error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
