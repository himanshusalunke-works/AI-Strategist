import { useEffect, useRef } from 'react';
import { Target, TrendingUp, Layers, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './ReadinessCard.css';

const URGENCY_CONFIG = {
    critical: { label: '🚨 Exam very close — focus immediately!', cls: 'urgency-critical' },
    high:     { label: '⚠️ Exam approaching fast — ramp up now', cls: 'urgency-high' },
    medium:   { label: '📅 2 weeks out — stay consistent', cls: 'urgency-medium' },
    normal:   null,
};

export default function ReadinessCard({
    score,
    daysUntil,
    coverage,
    avgAccuracy,
    recencyBonus = 0,
    severityPenalty = 0,
    urgency = null,
}) {
    const circleRef = useRef(null);

    useEffect(() => {
        if (circleRef.current) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (score / 100) * circumference;
            circleRef.current.style.strokeDasharray = circumference;
            circleRef.current.style.strokeDashoffset = offset;
        }
    }, [score]);

    const getColor = () => {
        if (score >= 80) return '#22C55E';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getLabel = () => {
        if (score >= 80) return { text: 'Excellent', icon: '🏆' };
        if (score >= 60) return { text: 'Good Progress', icon: '📈' };
        if (score >= 40) return { text: 'Needs Work', icon: '📚' };
        return { text: 'Critical', icon: '💪' };
    };

    const color = getColor();
    const label = getLabel();
    const urgencyInfo = urgency ? URGENCY_CONFIG[urgency] : null;

    return (
        <div className="card readiness-card animate-fade-in">
            {/* Glow accent */}
            <div className="readiness-glow" style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}22, transparent 70%)` }} />

            <div className="card-header">
                <div>
                    <div className="card-title">Exam Readiness</div>
                    <div className="card-subtitle">
                        {daysUntil > 0 ? `${daysUntil} day${daysUntil !== 1 ? 's' : ''} until exam` : '🎓 Exam day!'}
                    </div>
                </div>
                <div className="readiness-header-icon" style={{ background: `${color}18`, color }}>
                    <Target size={20} />
                </div>
            </div>

            {/* Urgency Banner */}
            {urgencyInfo && (
                <div className={`readiness-urgency-banner ${urgencyInfo.cls}`}>
                    <AlertTriangle size={13} />
                    {urgencyInfo.label}
                </div>
            )}

            <div className="readiness-body">
                {/* Circular gauge */}
                <div className="readiness-circle-wrapper">
                    <svg className="readiness-svg" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" strokeWidth="8" />
                        {/* Progress */}
                        <circle
                            ref={circleRef}
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke={color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="readiness-progress-circle"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="readiness-score-display">
                        <span className="readiness-score-number" style={{ color }}>{score}</span>
                        <span className="readiness-score-percent">%</span>
                    </div>
                </div>

                <div className="readiness-label-row">
                    <span className="readiness-emoji">{label.icon}</span>
                    <span className="readiness-label-text" style={{ color }}>{label.text}</span>
                </div>

                {/* Stats row */}
                <div className="readiness-stats">
                    <div className="readiness-stat">
                        <div className="readiness-stat-icon"><TrendingUp size={13} /></div>
                        <div>
                            <div className="readiness-stat-value">{avgAccuracy}%</div>
                            <div className="readiness-stat-label">Avg Mastery</div>
                        </div>
                    </div>
                    <div className="readiness-stat-divider" />
                    <div className="readiness-stat">
                        <div className="readiness-stat-icon"><Layers size={13} /></div>
                        <div>
                            <div className="readiness-stat-value">{coverage}%</div>
                            <div className="readiness-stat-label">Coverage</div>
                        </div>
                    </div>
                </div>

                {/* Formula chips */}
                {(recencyBonus > 0 || severityPenalty > 0) && (
                    <div className="readiness-chips">
                        {recencyBonus > 0 && (
                            <span className="readiness-chip chip-bonus">
                                <Zap size={11} /> +{recencyBonus} recency bonus
                            </span>
                        )}
                        {severityPenalty > 0 && (
                            <span className="readiness-chip chip-penalty">
                                <AlertTriangle size={11} /> −{severityPenalty} weak topics
                            </span>
                        )}
                    </div>
                )}

                {score >= 80 && (
                    <div className="readiness-congrats">
                        <CheckCircle2 size={13} /> You're exam-ready! Keep it up.
                    </div>
                )}
            </div>
        </div>
    );
}
