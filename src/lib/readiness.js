/**
 * Readiness Engine
 * Calculates exam readiness score based on topic mastery data
 * 
 * Formula:
 *   Readiness = (Avg Topic Accuracy × Coverage) − Weak Penalty
 *   Coverage = Topics Attempted / Total Topics
 *   Weak Penalty = number of topics < 60% × penalty factor
 */

const WEAK_THRESHOLD = 60;
const PENALTY_FACTOR = 3;

export function calculateReadiness(topics) {
    if (!topics || topics.length === 0) {
        return { readinessScore: 0, weakTopics: [], topicBreakdown: [], coverage: 0 };
    }

    const totalTopics = topics.length;
    const attemptedTopics = topics.filter(t => t.mastery_score > 0);
    const coverage = attemptedTopics.length / totalTopics;

    const avgAccuracy = topics.reduce((sum, t) => sum + t.mastery_score, 0) / totalTopics;

    const weakTopics = topics.filter(t => t.mastery_score < WEAK_THRESHOLD);
    const weakPenalty = weakTopics.length * PENALTY_FACTOR;

    const readinessScore = Math.max(0, Math.min(100, Math.round(avgAccuracy * coverage - weakPenalty)));

    const topicBreakdown = topics.map(t => ({
        id: t.id,
        name: t.name,
        mastery: t.mastery_score,
        status: t.mastery_score >= 80 ? 'strong' : t.mastery_score >= 60 ? 'moderate' : 'weak'
    }));

    return {
        readinessScore,
        weakTopics: weakTopics.map(t => ({ id: t.id, name: t.name, mastery: t.mastery_score })),
        topicBreakdown,
        coverage: Math.round(coverage * 100),
        avgAccuracy: Math.round(avgAccuracy)
    };
}

export function getStatusColor(mastery) {
    if (mastery >= 80) return 'green';
    if (mastery >= 60) return 'orange';
    return 'red';
}

export function getStatusLabel(mastery) {
    if (mastery >= 80) return 'Strong';
    if (mastery >= 60) return 'Moderate';
    return 'Weak';
}

export function getDaysUntilExam(examDate) {
    const now = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}
