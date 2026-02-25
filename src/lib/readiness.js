/**
 * Readiness Engine — v2 (Adaptive Formula)
 *
 * Formula:
 *   Readiness = clamp(0, 100,
 *     (weightedMastery × coverage) − severityPenalty + recencyBonus
 *   )
 *
 * Components:
 *   weightedMastery  — mastery averaged by attempt count
 *                      (topics with more quiz data are trusted more)
 *   coverage         — fraction of topics actually attempted (0–1)
 *                      untouched topics drag the score down
 *   severityPenalty  — heavier penalty for critically weak topics
 *                      Critical(<40%): −8 | Weak(<60%): −4 | Moderate(<75%): −1
 *   recencyBonus     — reward for topics recently practised well
 *                      last_accuracy ≥ 70% → +3 per topic, cap +15
 *   urgency          — exam-proximity context returned alongside the score
 *                      (used by UI to show warnings when exam is close)
 */

// ── Thresholds ────────────────────────────────────────────────────────────────
const CRITICAL_THRESHOLD  = 40;  // < 40% → critical mastery
const WEAK_THRESHOLD      = 60;  // < 60% → weak mastery
const MODERATE_THRESHOLD  = 75;  // < 75% → moderate mastery

// ── Penalty weights per severity tier ─────────────────────────────────────────
const PENALTY_CRITICAL  = 8;     // strongest drag
const PENALTY_WEAK      = 4;
const PENALTY_MODERATE  = 1;     // mild drag

// ── Recency bonus ──────────────────────────────────────────────────────────────
const RECENCY_MIN_ACCURACY = 70; // last_accuracy >= this counts as "recent good practice"
const RECENCY_BONUS_PER    = 3;  // +3 per qualifying topic
const RECENCY_BONUS_CAP    = 15; // maximum bonus

/**
 * @param {Array}  topics    - Array of topic objects from Supabase
 *                             Expected fields: mastery_score, total_attempts, last_accuracy
 * @param {string} examDate  - ISO date string for the exam (optional)
 *                             When provided, adds an urgency assessment to the result
 * @returns {Object}
 */
export function calculateReadiness(topics, examDate = null) {
    if (!topics || topics.length === 0) {
        return {
            readinessScore:  0,
            weakTopics:      [],
            topicBreakdown:  [],
            coverage:        0,
            avgAccuracy:     0,
            recencyBonus:    0,
            severityPenalty: 0,
            urgency:         examDate ? computeUrgency(getDaysUntilExam(examDate), 0) : null,
        };
    }

    const totalTopics = topics.length;

    // ── 1. Coverage (0–1) ──────────────────────────────────────────────────────
    // Any topic that has been attempted at least once counts as covered.
    const attemptedTopics = topics.filter(t => (t.total_attempts || 0) > 0);
    const coverage = attemptedTopics.length / totalTopics;

    // ── 2. Attempt-weighted mastery ────────────────────────────────────────────
    // Topics with more quiz attempts produce a more reliable mastery signal.
    // log(1 + attempts) gives a diminishing-returns weight; floor at 1 so
    // zero-attempt topics still contribute (at minimum weight) rather than
    // being silently ignored.
    let weightSum = 0;
    let weightedMasterySum = 0;
    for (const t of topics) {
        const w = Math.log1p(t.total_attempts || 0) + 1; // min weight = 1
        weightedMasterySum += t.mastery_score * w;
        weightSum += w;
    }
    const weightedMastery = weightedMasterySum / weightSum; // 0–100

    // ── 3. Severity-weighted penalty ───────────────────────────────────────────
    const criticalTopics = topics.filter(t => t.mastery_score < CRITICAL_THRESHOLD);
    const weakTopics     = topics.filter(t => t.mastery_score >= CRITICAL_THRESHOLD && t.mastery_score < WEAK_THRESHOLD);
    const moderateTopics = topics.filter(t => t.mastery_score >= WEAK_THRESHOLD     && t.mastery_score < MODERATE_THRESHOLD);

    const severityPenalty =
        criticalTopics.length * PENALTY_CRITICAL +
        weakTopics.length     * PENALTY_WEAK     +
        moderateTopics.length * PENALTY_MODERATE;

    // ── 4. Recency bonus ───────────────────────────────────────────────────────
    // Topics recently practised with good accuracy are evidence of active improvement.
    const recentlyPracticed = topics.filter(
        t => (t.total_attempts || 0) > 0 && (t.last_accuracy || 0) >= RECENCY_MIN_ACCURACY
    );
    const recencyBonus = Math.min(RECENCY_BONUS_CAP, recentlyPracticed.length * RECENCY_BONUS_PER);

    // ── 5. Final score ─────────────────────────────────────────────────────────
    const raw = (weightedMastery * coverage) - severityPenalty + recencyBonus;
    const readinessScore = Math.max(0, Math.min(100, Math.round(raw)));

    // ── 6. Topic breakdown ─────────────────────────────────────────────────────
    const topicBreakdown = topics.map(t => ({
        id:      t.id,
        name:    t.name,
        mastery: t.mastery_score,
        status:  t.mastery_score >= MODERATE_THRESHOLD ? 'strong'
               : t.mastery_score >= WEAK_THRESHOLD     ? 'moderate'
               : t.mastery_score >= CRITICAL_THRESHOLD ? 'weak'
               : 'critical',
    }));

    // All topics below the WEAK threshold are returned as "weak topics"
    const allWeakTopics = [...criticalTopics, ...weakTopics].map(t => ({
        id:     t.id,
        name:   t.name,
        mastery: t.mastery_score,
        status:  t.mastery_score < CRITICAL_THRESHOLD ? 'critical' : 'weak',
    }));

    return {
        readinessScore,
        weakTopics:      allWeakTopics,
        topicBreakdown,
        coverage:        Math.round(coverage * 100),   // 0–100 %
        avgAccuracy:     Math.round(weightedMastery),  // attempt-weighted avg
        recencyBonus,
        severityPenalty: Math.round(severityPenalty),
        urgency: examDate ? computeUrgency(getDaysUntilExam(examDate), readinessScore) : null,
    };
}

/**
 * Computes an urgency level based on how close the exam is and
 * how prepared the student currently is.
 *
 * @param {number} daysUntilExam
 * @param {number} readinessScore  0–100
 * @returns {'critical'|'high'|'medium'|'normal'}
 */
function computeUrgency(daysUntilExam, readinessScore) {
    if (daysUntilExam <= 3  && readinessScore < 60) return 'critical';
    if (daysUntilExam <= 7  && readinessScore < 50) return 'high';
    if (daysUntilExam <= 14 && readinessScore < 40) return 'medium';
    return 'normal';
}

// ── Standalone helpers (used across the app) ──────────────────────────────────

export function getStatusColor(mastery) {
    if (mastery >= MODERATE_THRESHOLD) return 'green';
    if (mastery >= WEAK_THRESHOLD)     return 'orange';
    return 'red'; // covers both 'weak' and 'critical'
}

export function getStatusLabel(mastery) {
    if (mastery >= MODERATE_THRESHOLD) return 'Strong';
    if (mastery >= WEAK_THRESHOLD)     return 'Moderate';
    if (mastery >= CRITICAL_THRESHOLD) return 'Weak';
    return 'Critical';
}

export function getDaysUntilExam(examDate) {
    const now  = new Date();
    const exam = new Date(examDate);
    if (Number.isNaN(exam.getTime())) return 0;
    const diffDays = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}
