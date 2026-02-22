import { useState, useEffect } from 'react';
import { schedulesApi } from '../../lib/api';
import { generateScheduleWithAI } from '../../lib/scheduleGenerator';
import { Sparkles, RefreshCw, Clock, BookOpen, Lightbulb } from 'lucide-react';
import './StudyPlanCard.css';

// Colour cycling for calendar day cells
const DAY_ACCENT_COLORS = [
    { bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.25)',  header: 'rgba(79,70,229,0.12)',  dot: '#4F46E5' },
    { bg: 'rgba(6,182,212,0.07)',  border: 'rgba(6,182,212,0.25)',  header: 'rgba(6,182,212,0.12)',  dot: '#06B6D4' },
    { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.25)',  header: 'rgba(34,197,94,0.12)',  dot: '#22C55E' },
    { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', header: 'rgba(245,158,11,0.12)', dot: '#F59E0B' },
    { bg: 'rgba(236,72,153,0.07)', border: 'rgba(236,72,153,0.25)', header: 'rgba(236,72,153,0.12)', dot: '#EC4899' },
    { bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.25)', header: 'rgba(139,92,246,0.12)', dot: '#8B5CF6' },
    { bg: 'rgba(20,184,166,0.07)', border: 'rgba(20,184,166,0.25)', header: 'rgba(20,184,166,0.12)', dot: '#14B8A6' },
];

export default function StudyPlanCard({ schedule, subject, topics, onRefresh }) {
    const [loading, setLoading]               = useState(false);
    const [expandedItem, setExpandedItem]     = useState(null); // `${dayKey}-${idx}`
    const [cooldownTime, setCooldownTime]     = useState(0);
    const [apiError, setApiError]             = useState(null);

    useEffect(() => {
        if (cooldownTime > 0) {
            const timer = setTimeout(() => setCooldownTime(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownTime]);

    const handleGenerate = async () => {
        if (loading || cooldownTime > 0) return;
        setLoading(true);
        setApiError(null);
        try {
            const scheduleData = await generateScheduleWithAI(
                topics, subject.exam_date, subject.daily_study_hours, subject.id
            );
            await schedulesApi.save({ subject_id: subject.id, schedule_data: scheduleData });
            onRefresh();
            setCooldownTime(10);
        } catch (error) {
            console.error('Schedule generation failed:', error);
            if (error.message?.includes('429') || error.status === 429) {
                setApiError('Rate limit exceeded. Please wait a moment before trying again.');
                setCooldownTime(10);
            } else {
                setApiError('Failed to generate schedule. Please try again.');
                setCooldownTime(5);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (key) =>
        setExpandedItem(prev => (prev === key ? null : key));

    const days = schedule ? Object.entries(schedule) : [];

    return (
        <div className="card study-plan-card animate-fade-in stagger-4">
            {/* Header */}
            <div className="card-header">
                <div>
                    <div className="card-title">
                        <Sparkles size={18} className="sparkle-icon" />
                        AI Study Plan
                    </div>
                    <div className="card-subtitle">
                        {schedule
                            ? `${days.length}-day personalised schedule`
                            : 'Generate your AI-powered study plan'}
                    </div>
                </div>
                <button
                    className={`btn ${schedule ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    onClick={handleGenerate}
                    disabled={loading || cooldownTime > 0}
                >
                    {loading ? (
                        <><div className="spinner" /> Generating...</>
                    ) : schedule ? (
                        <><RefreshCw size={14} /> {cooldownTime > 0 ? `Wait ${cooldownTime}s` : 'Regenerate'}</>
                    ) : (
                        <><Sparkles size={14} /> Generate Plan</>
                    )}
                </button>
            </div>

            {apiError && (
                <div className="plan-error-banner">
                    {apiError} {cooldownTime > 0 ? `(Wait ${cooldownTime}s)` : ''}
                </div>
            )}

            {/* Empty state */}
            {!schedule ? (
                <div className="plan-empty">
                    <Sparkles size={40} className="plan-empty-icon" />
                    <h3>No Study Plan Yet</h3>
                    <p>Click "Generate Plan" to create an AI-optimised schedule based on your topic mastery.</p>
                </div>
            ) : (
                /* ---- Calendar Grid ---- */
                <div className="plan-calendar-grid">
                    {days.map(([dayKey, items], dayIdx) => {
                        const accent    = DAY_ACCENT_COLORS[dayIdx % DAY_ACCENT_COLORS.length];
                        const totalMins = items.reduce((s, i) => s + i.duration, 0);

                        return (
                            <div
                                key={dayKey}
                                className="plan-cal-cell"
                                style={{
                                    background:   accent.bg,
                                    borderColor:  accent.border,
                                }}
                            >
                                {/* Day header */}
                                <div
                                    className="plan-cal-cell-header"
                                    style={{ background: accent.header }}
                                >
                                    <span className="plan-cal-day-label" style={{ color: accent.dot }}>
                                        {dayKey}
                                    </span>
                                    <span className="plan-cal-day-meta">
                                        <Clock size={11} /> {totalMins} min
                                    </span>
                                </div>

                                {/* Topic chips */}
                                <div className="plan-cal-topics">
                                    {items.map((item, idx) => {
                                        const key       = `${dayKey}-${idx}`;
                                        const isOpen    = expandedItem === key;

                                        return (
                                            <div key={idx} className="plan-cal-topic-wrap">
                                                <button
                                                    className={`plan-cal-topic-chip ${isOpen ? 'plan-cal-topic-chip-open' : ''}`}
                                                    onClick={() => toggleItem(key)}
                                                    title="Click to see today's study tip"
                                                >
                                                    <span
                                                        className="plan-cal-dot"
                                                        style={{ background: accent.dot }}
                                                    />
                                                    <span className="plan-cal-topic-name">{item.topic}</span>
                                                    <span className="plan-cal-chip-dur">
                                                        {item.duration}m
                                                    </span>
                                                </button>

                                                {/* Expandable reason tooltip */}
                                                {isOpen && (
                                                    <div className="plan-cal-reason animate-fade-in">
                                                        <Lightbulb size={13} className="plan-cal-reason-icon" />
                                                        <p>{item.reason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer count */}
                                <div className="plan-cal-cell-footer">
                                    <BookOpen size={11} />
                                    {items.length} {items.length === 1 ? 'topic' : 'topics'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
