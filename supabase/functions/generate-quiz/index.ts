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

function isValidQuestion(item) {
  return !!item &&
    typeof item.q === "string" &&
    Array.isArray(item.options) &&
    item.options.length === 4 &&
    item.options.every((opt) => typeof opt === "string") &&
    Number.isInteger(item.answer) &&
    item.answer >= 0 &&
    item.answer <= 3;
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

    const { topicName, userContext = {} } = body || {};

    if (!topicName || typeof topicName !== "string" || topicName.trim().length === 0) {
      return jsonResponse({ error: "Missing required field: topicName" }, 400);
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return jsonResponse({ error: "GROQ_API_KEY secret not configured" }, 500);
    }

    const profileLines = [];
    if (userContext.board)       profileLines.push(`- Board / Curriculum: ${userContext.board}`);
    if (userContext.study_level) profileLines.push(`- Study Level: ${userContext.study_level}`);
    if (userContext.university)  profileLines.push(`- Institution: ${userContext.university}`);
    if (userContext.target_exam) profileLines.push(`- Target Exam: ${userContext.target_exam}`);

    const studentProfile = profileLines.length > 0
      ? `\n\nStudent profile (use this to calibrate difficulty, terminology, and syllabus):\n${profileLines.join("\n")}`
      : "";

    const systemPrompt = `Act as an expert tutor. Create exactly 5 high-quality, multiple-choice questions testing the academic topic provided by the user.${studentProfile}

Requirements:
1. Calibrate difficulty and language to suit the student's board/level above.
2. For school boards (CBSE, ICSE, State Board) use curriculum-specific examples and standard syllabus content.
3. For entrance exams (JEE/NEET/UPSC/GATE) make questions more application/problem-solving oriented.
4. For university / postgraduate levels, use advanced concepts and technical terminology.
5. Questions should test real conceptual understanding, not just trivia.
6. Provide exactly 4 plausible options for each question.
7. The 'answer' field must be the zero-based index of the correct option (0, 1, 2, or 3).
8. Do NOT include any markdown formatting or extra text.

Return your response as a valid JSON object with a single root key called "quiz":
{
  "quiz": [
    {
      "q": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": 2
    }
  ]
}`;

    const userPrompt = `Topic: "${topicName.trim()}"`;

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

    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch (parseErr) {
      return jsonResponse({ error: "Invalid quiz format from Groq", detail: String(parseErr) }, 502);
    }

    const quiz = Array.isArray(parsedJson?.quiz)
      ? parsedJson.quiz.filter(isValidQuestion).slice(0, 5)
      : [];

    if (quiz.length === 0) {
      return jsonResponse({ error: "Invalid quiz format from Groq" }, 502);
    }

    return jsonResponse({ quiz }, 200);
  } catch (err) {
    return jsonResponse({ error: "Internal server error", detail: String(err) }, 500);
  }
});
