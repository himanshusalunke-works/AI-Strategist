/**
 * AI Schedule Generator
 * Constructs prompt, calls AI API, validates response
 */

import { aiLogsApi } from './api';

// Fallback schedule generator (when no API key is available)
export function generateScheduleLocally(topics, examDate, dailyHours) {
    const daysUntil = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
    const scheduleDays = Math.min(daysUntil, 7); // Plan for up to 7 days
    const minutesPerDay = dailyHours * 60;

    // Rank topics by priority: low mastery first, then by name
    const ranked = [...topics].sort((a, b) => a.mastery_score - b.mastery_score);

    const schedule = {};

    for (let d = 1; d <= scheduleDays; d++) {
        const dayKey = `Day ${d}`;
        schedule[dayKey] = [];
        let remainingMinutes = minutesPerDay;

        for (const topic of ranked) {
            if (remainingMinutes <= 0) break;

            // Allocate more time to weaker topics
            let duration;
            if (topic.mastery_score < 40) {
                duration = Math.min(60, remainingMinutes);
            } else if (topic.mastery_score < 60) {
                duration = Math.min(45, remainingMinutes);
            } else if (topic.mastery_score < 80) {
                duration = Math.min(30, remainingMinutes);
            } else {
                duration = Math.min(20, remainingMinutes);
            }

            let reason;
            if (topic.mastery_score < 40) {
                reason = `Critical: Very low mastery (${topic.mastery_score}%). Needs intensive practice with ${daysUntil} days until exam.`;
            } else if (topic.mastery_score < 60) {
                reason = `High priority: Below passing threshold (${topic.mastery_score}%). Focus on fundamentals.`;
            } else if (topic.mastery_score < 80) {
                reason = `Moderate: Good progress (${topic.mastery_score}%) but room for improvement. Practice advanced problems.`;
            } else {
                reason = `Review: Strong mastery (${topic.mastery_score}%). Light revision to maintain knowledge.`;
            }

            schedule[dayKey].push({
                topic: topic.name,
                duration,
                reason
            });

            remainingMinutes -= duration;
        }
    }

    return schedule;
}

// AI-powered schedule generation (requires API key)
export async function generateScheduleWithAI(topics, examDate, dailyHours, apiKey, subjectId = null) {
    if (!apiKey) {
        // Fall back to local generation
        return generateScheduleLocally(topics, examDate, dailyHours);
    }

    try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

        const daysUntil = Math.max(1, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));
        const scheduleDays = Math.min(daysUntil, 7);

        const topicData = topics.map(t => `- ${t.name}: mastery ${t.mastery_score}%`).join('\n');

        const systemPrompt = `You are an expert study planner. Create a ${scheduleDays}-day study schedule for a student. Return ONLY valid JSON in the exact format requested.

Constraints:
- Exam is in ${daysUntil} days
- Student can study ${dailyHours} hours/day (${dailyHours * 60} minutes)
- Prioritize weak topics (< 60% mastery)
- Balance workload across days
- Give more time to topics with lowest mastery
- For the "reason" field, you MUST categorize and explain based on mastery:
  * < 40%: "Critical: Very low mastery. Needs intensive practice."
  * < 60%: "High priority: Below passing threshold. Focus on fundamentals."
  * < 80%: "Moderate: Good progress but room for improvement."
  * >= 80%: "Review: Strong mastery. Light revision to maintain knowledge."
  Append a brief tip specific to the topic to these categories.

Return EXACTLY this JSON structure:
{
  "Day 1": [
    {"topic": "Topic Name", "duration": 60, "reason": "Explanation according to mastery score"}
  ]
}
Each day's total duration must not exceed ${dailyHours * 60} minutes.`;

        const userPrompt = `Study Data:\n${topicData}\n\nGenerate the JSON schedule.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const text = completion.choices[0]?.message?.content || "";

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No valid JSON in AI response');

        const schedule = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (typeof schedule !== 'object') throw new Error('Invalid schedule format');

        // Log to database asynchronously without waiting to avoid slowing down user
        aiLogsApi.insert({
            subject_id: subjectId,
            prompt_used: prompt,
            ai_output: schedule
        }).catch(err => console.error("Failed async AI log insert:", err));

        return schedule;
    } catch (error) {
        console.error('AI generation failed, using local fallback:', error);
        return generateScheduleLocally(topics, examDate, dailyHours);
    }
}
