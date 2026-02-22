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

    const systemPrompt = `You are an expert study planner. Create a ${scheduleDays}-day study schedule for a student. Return ONLY valid JSON in the exact format requested.

Constraints:
- Exam is in ${daysUntil} days
- Student can study ${dailyHours} hours/day (${dailyHours * 60} minutes)
- Prioritize weak topics (< 60% mastery)
- Balance workload across days
- Give more time to topics with lowest mastery
- For the "reason" field, categorize and explain based on mastery:
  * < 40%: "Critical: Very low mastery. Needs intensive practice."
  * < 60%: "High priority: Below passing threshold. Focus on fundamentals."
  * < 80%: "Moderate: Good progress but room for improvement."
  * >= 80%: "Review: Strong mastery. Light revision to maintain knowledge."
  Append a brief tip specific to the topic.

Return EXACTLY this JSON structure:
{
  "Day 1": [
    {"topic": "Topic Name", "duration": 60, "reason": "Explanation"}
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

    const schedule = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ schedule }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
