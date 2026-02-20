import { aiLogsApi } from './api';
import { getQuestions as getStaticQuestions } from './questionBank';

/**
 * Generate a personalized 5-question multiple choice quiz using Gemini AI.
 * Falls back to static questionBank if API fails or key is missing.
 *
 * @param {string} topicName
 * @param {string} apiKey
 * @param {string} topicId (Optional, for logging)
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuizWithAI(topicName, apiKey, topicId = null) {
    if (!apiKey) {
        // Fall back to local static questions
        console.warn('No Gemini API key found, using local fallback questions.');
        return getStaticQuestions(topicName).slice(0, 5);
    }

    try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

        const systemPrompt = `Act as an expert tutor. Create exactly 5 high-quality, multiple-choice questions testing the academic topic provided by the user.

Requirements:
1. Questions should test real conceptual understanding, not just trivia.
2. Provide exactly 4 plausible options for each question.
3. The 'answer' field must be the zero-based index of the correct option (0, 1, 2, or 3).
4. Do NOT include any markdown formatting or extra text.

Return your response as a valid JSON object with a single root key called "quiz", which contains the array of question objects, like this EXACT format:
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

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content || "";

        const parsedJson = JSON.parse(text);
        const quizData = parsedJson.quiz;

        if (!Array.isArray(quizData) || quizData.length === 0) {
            throw new Error('Invalid quiz array format returned by Groq');
        }

        // Log the generation asynchronously!
        aiLogsApi.insert({
            subject_id: topicId, // using topicId here as it's the closest reference
            prompt_used: userPrompt,
            ai_output: quizData
        }).catch(err => console.error("Failed async AI log insert for quiz:", err));

        return quizData.slice(0, 5); // Ensure exactly 5 questions maximum

    } catch (error) {
        console.error('AI Quiz generation failed, using local fallback:', error);
        return getStaticQuestions(topicName).slice(0, 5);
    }
}
