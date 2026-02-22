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
    const { topicName, topicId, userContext = {} } = await req.json();

    if (!topicName) {
      return new Response(
        JSON.stringify({ error: "Missing required field: topicName" }),
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

    // Build a student profile string — only include fields that are actually set
    const profileLines: string[] = [];
    if (userContext.board)        profileLines.push(`- Board / Curriculum: ${userContext.board}`);
    if (userContext.study_level)  profileLines.push(`- Study Level: ${userContext.study_level}`);
    if (userContext.university)   profileLines.push(`- Institution: ${userContext.university}`);
    if (userContext.target_exam)  profileLines.push(`- Target Exam: ${userContext.target_exam}`);

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

    const userPrompt = `Topic: "${topicName}"`;

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
    const parsedJson = JSON.parse(text);
    const quiz = parsedJson.quiz;

    if (!Array.isArray(quiz) || quiz.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz format from Groq" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ quiz: quiz.slice(0, 5) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

