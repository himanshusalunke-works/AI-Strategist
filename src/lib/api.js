/**
 * Supabase API Layer
 * Centralized CRUD operations for all database tables.
 */

import { supabase } from './supabase';

/**
 * Returns the current user ID from the LOCAL session cache — no network call.
 * supabase.auth.getUser() hits the Supabase auth server every time (slow).
 * supabase.auth.getSession() reads from memory/localStorage (instant).
 */
async function getUserId() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('User not authenticated');
    return session.user.id;
}

// ============================================
// In-memory cache  (stale-while-revalidate)
// ============================================
// Caching read results means navigating back to a page is instant —
// the cached value renders immediately, while a background refresh
// updates the data silently.  TTL of 45 s is short enough to stay
// fresh but long enough to cover all in-session navigation.

const _cache   = new Map();
const CACHE_TTL = 45_000; // ms

function cacheGet(key) {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
    return entry.data;
}
function cacheSet(key, data)   { _cache.set(key, { data, ts: Date.now() }); }
function cacheInvalidate(pat)  { for (const k of _cache.keys()) if (k.includes(pat)) _cache.delete(k); }


// ============================================
// SUBJECTS
// ============================================

export const subjectsApi = {
    async getAll() {
        const cached = cacheGet('subjects:all');
        if (cached) return cached;
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        const result = data || [];
        cacheSet('subjects:all', result);
        return result;
    },

    async getById(id) {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async create({ name, exam_date, daily_study_hours }) {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('subjects')
            .insert({
                user_id: userId,
                name,
                exam_date,
                daily_study_hours: Number(daily_study_hours)
            })
            .select()
            .single();
        if (error) throw error;
        cacheInvalidate('subjects');
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('subjects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        cacheInvalidate('subjects');
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);
        if (error) throw error;
        cacheInvalidate('subjects');
        cacheInvalidate('topics:sub:' + id);
        cacheInvalidate('schedule:' + id);
    }
};

// ============================================
// TOPICS
// ============================================

export const topicsApi = {
    async getBySubject(subjectId) {
        const key = 'topics:sub:' + subjectId;
        const cached = cacheGet(key);
        if (cached) return cached;
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('subject_id', subjectId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        const result = data || [];
        cacheSet(key, result);
        return result;
    },

    async getAll() {
        const cached = cacheGet('topics:all');
        if (cached) return cached;
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('topics')
            .select('*, subjects!inner(user_id)')
            .eq('subjects.user_id', userId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        const result = (data || []).map(({ subjects, ...topic }) => topic);
        cacheSet('topics:all', result);
        return result;
    },

    async getById(id) {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('topics')
            .select('*, subjects!inner(user_id)')
            .eq('id', id)
            .eq('subjects.user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async create({ subject_id, name }) {
        const { data, error } = await supabase
            .from('topics')
            .insert({ subject_id, name })
            .select()
            .single();
        if (error) throw error;
        cacheInvalidate('topics:sub:' + subject_id);
        cacheInvalidate('topics:all');
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('topics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        // topic id can't tell us subject_id here, flush all topic caches
        cacheInvalidate('topics:');
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);
        if (error) throw error;
        cacheInvalidate('topics:');
    },

    async updateMastery(id, newAccuracy) {
        const topic = await this.getById(id);
        if (!topic) throw new Error('Topic not found');

        const newMastery = Math.round((topic.mastery_score + newAccuracy) / 2);
        const newTotalAttempts = (topic.total_attempts || 0) + 1;

        const { data, error } = await supabase
            .from('topics')
            .update({
                mastery_score: newMastery,
                total_attempts: newTotalAttempts,
                last_accuracy: newAccuracy
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        // Mastery changed — flush topic caches so dashboard shows fresh scores
        cacheInvalidate('topics:');
        return data;
    }
};

// ============================================
// QUIZ ATTEMPTS
// ============================================

export const quizApi = {
    async recordAttempt({ topic_id, accuracy, time_taken_seconds, questions_data }) {
        const userId = await getUserId();

        const payload = {
            topic_id,
            user_id: userId,
            accuracy,
            time_taken_seconds: time_taken_seconds ?? null,
            questions_data: questions_data ?? null,   // full Q&A snapshot
        };

        let attempt;
        let error;

        ({ data: attempt, error } = await supabase
            .from('quiz_attempts')
            .insert(payload)
            .select()
            .single());

        // Backward compatibility: older DB schema may not have questions_data column yet.
        if (error && String(error.message || '').toLowerCase().includes('questions_data')) {
            ({ data: attempt, error } = await supabase
                .from('quiz_attempts')
                .insert({
                    topic_id,
                    user_id: userId,
                    accuracy,
                    time_taken_seconds: time_taken_seconds ?? null,
                })
                .select()
                .single());
        }
        if (error) throw error;

        const updatedTopic = await topicsApi.updateMastery(topic_id, accuracy);
        return { attempt, updatedTopic };
    },

    async getAttemptsByTopic(topicId) {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('topic_id', topicId)
            .eq('user_id', userId)
            .order('attempted_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    async getAllAttempts() {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', userId)
            .order('attempted_at', { ascending: true });
        if (error) throw error;
        return data || [];
    }
};

// ============================================
// SCHEDULES
// ============================================

export const schedulesApi = {
    async getBySubject(subjectId) {
        const userId = await getUserId();
        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('user_id', userId)
            .order('generated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    async save({ subject_id, schedule_data }) {
        const userId = await getUserId();

        await supabase
            .from('schedules')
            .delete()
            .eq('subject_id', subject_id)
            .eq('user_id', userId);

        const { data, error } = await supabase
            .from('schedules')
            .insert({
                user_id: userId,
                subject_id,
                schedule_data
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================
// AI LOGS
// ============================================

export const aiLogsApi = {
    async insert({ subject_id, prompt_used, ai_output }) {
        const userId = await getUserId();

        const { data, error } = await supabase
            .from('ai_logs')
            .insert({
                user_id: userId,
                subject_id: subject_id || null,
                prompt_used,
                ai_output
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to insert AI log:', error);
            return null;
        }
        return data;
    }
};
