/**
 * AI Schedule Generator
 * Constructs prompt, calls Supabase Edge Function → Groq (server-side), validates response.
 * The Groq API key is NEVER exposed to the browser.
 */

import { supabase } from './supabase';

// Fallback schedule generator (when edge function is unavailable)
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

/**
 * AI-powered schedule generation via Supabase Edge Function.
 * The Groq key never leaves the server.
 *
 * @param {Array}  topics          - Array of topic objects with name & mastery_score
 * @param {string} examDate        - ISO exam date string
 * @param {number} dailyHours      - Hours available per day
 * @param {string|null} subjectId  - Optional, for AI logging
 * @returns {Promise<Object>}       - Schedule object keyed by "Day N"
 */
export async function generateScheduleWithAI(topics, examDate, dailyHours, subjectId = null) {
    try {
        const { data, error } = await supabase.functions.invoke('generate-schedule', {
            body: { topics, examDate, dailyHours, subjectId }
        });

        if (error) throw error;
        if (!data?.schedule) throw new Error('Edge function returned no schedule');

        return data.schedule;
    } catch (error) {
        console.error('AI schedule generation failed, using local fallback:', error);
        return generateScheduleLocally(topics, examDate, dailyHours);
    }
}
