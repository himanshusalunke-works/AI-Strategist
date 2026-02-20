/**
 * Supabase API Layer
 * Centralized CRUD operations for all database tables.
 * Replaces mockData.js with real Supabase calls.
 */

import { supabase } from './supabase';

// ============================================
// SUBJECTS
// ============================================

export const subjectsApi = {
    /** Get all subjects for the current user */
    async getAll() {
        // Ensure session is active before query
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    /** Get a single subject by ID */
    async getById(id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
        if (error) throw error;
        return data;
    },

    /** Create a new subject */
    async create({ name, exam_date, daily_study_hours }) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('subjects')
            .insert({
                user_id: user.id,
                name,
                exam_date,
                daily_study_hours: Number(daily_study_hours)
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** Update a subject */
    async update(id, updates) {
        const { data, error } = await supabase
            .from('subjects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** Delete a subject (cascades to topics, quiz_attempts, schedules) */
    async delete(id) {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// TOPICS
// ============================================

export const topicsApi = {
    /** Get all topics for a subject */
    async getBySubject(subjectId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('subject_id', subjectId)
            // Note: RLS on topics should verify through subject_id matching user_id
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    /** Get all topics for the current user (across all subjects) */
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('topics')
            .select('*, subjects!inner(user_id)')
            .eq('subjects.user_id', user.id)
            .order('created_at', { ascending: true });
        if (error) throw error;
        // Flatten — remove the joined subjects object
        return (data || []).map(({ subjects, ...topic }) => topic);
    },

    /** Get a single topic by ID */
    async getById(id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('topics')
            .select('*, subjects!inner(user_id)')
            .eq('id', id)
            .eq('subjects.user_id', user.id)
            .single();
        if (error) throw error;
        return data;
    },

    /** Create a new topic */
    async create({ subject_id, name }) {
        const { data, error } = await supabase
            .from('topics')
            .insert({ subject_id, name })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** Update a topic */
    async update(id, updates) {
        const { data, error } = await supabase
            .from('topics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /** Delete a topic */
    async delete(id) {
        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    /**
     * Update mastery score after a quiz attempt.
     * Formula: newMastery = Math.round((previousMastery + newAccuracy) / 2)
     */
    async updateMastery(id, newAccuracy) {
        // First get current topic data
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
        return data;
    }
};

// ============================================
// QUIZ ATTEMPTS
// ============================================

export const quizApi = {
    /**
     * Record a quiz attempt and update topic mastery.
     * Returns the updated topic data.
     */
    async recordAttempt({ topic_id, accuracy, time_taken_seconds }) {
        const { data: { user } } = await supabase.auth.getUser();

        // Insert the attempt
        const { data: attempt, error } = await supabase
            .from('quiz_attempts')
            .insert({
                topic_id,
                user_id: user.id,
                accuracy,
                time_taken_seconds: time_taken_seconds || null
            })
            .select()
            .single();
        if (error) throw error;

        // Update topic mastery
        const updatedTopic = await topicsApi.updateMastery(topic_id, accuracy);

        return { attempt, updatedTopic };
    },

    /** Get all quiz attempts for a specific topic */
    async getAttemptsByTopic(topicId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('topic_id', topicId)
            .eq('user_id', user.id)
            .order('attempted_at', { ascending: true });
        if (error) throw error;
        return data || [];
    },

    /** Get all quiz attempts for the current user */
    async getAllAttempts() {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', user.id)
            .order('attempted_at', { ascending: true });
        if (error) throw error;
        return data || [];
    }
};

// ============================================
// SCHEDULES
// ============================================

export const schedulesApi = {
    /** Get the latest schedule for a subject */
    async getBySubject(subjectId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('user_id', user.id)
            .order('generated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) throw error;
        return data;
    },

    /** Save a new schedule (replaces old one for that subject) */
    async save({ subject_id, schedule_data }) {
        const { data: { user } } = await supabase.auth.getUser();

        // Delete old schedules for this subject
        await supabase
            .from('schedules')
            .delete()
            .eq('subject_id', subject_id)
            .eq('user_id', user.id);

        // Insert new schedule
        const { data, error } = await supabase
            .from('schedules')
            .insert({
                user_id: user.id,
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
    /** 
     * Insert a new AI generation log to keep an audit trail.
     * @param {Object} log - { subject_id, prompt_used, ai_output }
     */
    async insert({ subject_id, prompt_used, ai_output }) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('ai_logs')
            .insert({
                user_id: user.id,
                subject_id: subject_id || null, // Optional connection to subject
                prompt_used,
                ai_output
            })
            .select()
            .single();
            
        if (error) {
            console.error('Failed to insert AI log:', error);
            // We usually don't want a logging failure to crash the whole app flow
            return null; 
        }
        return data;
    }
};
