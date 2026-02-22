import { supabase } from './supabase';
import { getQuestions as getStaticQuestions } from './questionBank';

/**
 * Generate a personalized 5-question multiple choice quiz via Supabase Edge Function → Groq.
 * Falls back to static questionBank if the edge function fails.
 * The Groq API key is NEVER exposed to the browser.
 *
 * @param {string} topicName
 * @param {string} topicId        (Optional, for logging)
 * @param {object} userContext    (Optional) { board, study_level, university, target_exam }
 * @returns {Promise<Array>} Array of question objects
 */
export async function generateQuizWithAI(topicName, topicId = null, userContext = {}) {
    try {
        const { data, error } = await supabase.functions.invoke('generate-quiz', {
            body: { topicName, topicId, userContext }
        });

        if (error) throw error;
        if (!Array.isArray(data?.quiz) || data.quiz.length === 0) {
            throw new Error('Edge function returned empty quiz');
        }

        return data.quiz.slice(0, 5);
    } catch (error) {
        console.error('AI quiz generation failed, using local fallback:', error);
        return getStaticQuestions(topicName).slice(0, 5);
    }
}
