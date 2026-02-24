// @ts-nocheck — runs on Deno runtime (Supabase Edge Functions), not Node.js.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topics, examDate, dailyHours, subjectId } = await req.json();

    if (!topics || !examDate || !dailyHours) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: topics, examDate, dailyHours" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const daysUntil = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const scheduleDays = Math.min(daysUntil, 7);
    const topicData = topics
      .map((t) => `- ${t.name}: mastery ${t.mastery_score}%`)
      .join("\n");

    const systemPrompt = `You are an expert study coach and subject matter tutor. Create a ${scheduleDays}-day study schedule for a student preparing for their exam in ${daysUntil} days.

Core rules:
- Student can study ${dailyHours} hours/day (${dailyHours * 60} minutes total per day)
- Prioritize weak topics (< 60% mastery) but don't ignore stronger ones
- Balance the workload — spread topics across days, don't dump everything on Day 1
- Give more time to topics with lowest mastery

CRITICAL — The "reason" field must be EDUCATIONAL and DAY-SPECIFIC:
- Each reason must be a UNIQUE, actionable study tip for THAT topic on THAT specific day
- Use day-progressive framing: Day 1 → build foundations, Day 2 → practice problems, Day 3 → deepen understanding, Day 4+ → application and edge cases
- Make it TOPIC-SPECIFIC: mention the actual concept, formula, or skill the student should work on TODAY
- End every reason with: "Key point: [one clear, concise fact or concept the student must be able to explain after this session]"
- NEVER repeat the same reason for the same topic on different days
- Keep each reason to 2 sentences maximum

Example of a GOOD reason: "Day 2 – Newton's Laws: Today, work through 10 application problems involving friction and inclined planes using free-body diagrams. Key point: Net force = mass × acceleration applies in every direction independently."

Example of a BAD reason (do NOT do this): "High priority: Below passing threshold. Focus on fundamentals."

Return EXACTLY this JSON structure:
{
  "Day 1": [
    {"topic": "Topic Name", "duration": 60, "reason": "Day 1 – Topic: ...study tip... Key point: ...concept..."}
  ]
}
Each day's total duration must not exceed ${dailyHours * 60} minutes.`;

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
      return new Response(
        JSON.stringify({ error: "Groq API call failed", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const text = groqData.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "No valid JSON in Groq response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let schedule;
    try {
      schedule = JSON.parse(jsonMatch[0]);
    } catch {
      return new Response(
        JSON.stringify({ error: "Malformed JSON in Groq response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ schedule }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
