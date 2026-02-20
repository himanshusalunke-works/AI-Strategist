import { useEffect, useRef } from 'react';
import { Target, TrendingUp, Layers } from 'lucide-react';
import './ReadinessCard.css';

export default function ReadinessCard({ score, daysUntil, coverage, avgAccuracy }) {
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
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good Progress';
        if (score >= 40) return 'Needs Work';
        return 'Critical';
    };

    return (
        <div className="card readiness-card animate-fade-in">
            <div className="card-header">
                <div>
                    <div className="card-title">Exam Readiness</div>
                    <div className="card-subtitle">{daysUntil > 0 ? `${daysUntil} days until exam` : 'Exam day!'}</div>
                </div>
                <Target size={20} color="var(--color-indigo)" />
            </div>

            <div className="readiness-body">
                <div className="readiness-circle-wrapper">
                    <svg className="readiness-svg" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="var(--bg-page)"
                            strokeWidth="8"
                        />
                        <circle
                            ref={circleRef}
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke={getColor()}
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="readiness-progress-circle"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="readiness-score-display">
                        <span className="readiness-score-number">{score}</span>
                        <span className="readiness-score-percent">%</span>
                    </div>
                </div>

                <div className="readiness-label" style={{ color: getColor() }}>
                    {getLabel()}
                </div>

                <div className="readiness-stats">
                    <div className="readiness-stat">
                        <TrendingUp size={14} />
                        <span>Avg Accuracy: {avgAccuracy}%</span>
                    </div>
                    <div className="readiness-stat">
                        <Layers size={14} />
                        <span>Coverage: {coverage}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
