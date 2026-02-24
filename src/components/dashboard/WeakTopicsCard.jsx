import { Link } from 'react-router-dom';
import { AlertTriangle, Flame, ArrowRight, PartyPopper } from 'lucide-react';
import './WeakTopicsCard.css';

export default function WeakTopicsCard({ weakTopics = [] }) {
    const criticalTopics = weakTopics.filter(t => t.status === 'critical');
    const weakOnly       = weakTopics.filter(t => t.status === 'weak');


    return (
        <div className="card weak-topics-card animate-fade-in stagger-3">
            <div className="card-header">
                <div>
                    <div className="card-title">Priority Focus Areas</div>
                    <div className="card-subtitle">
                        {weakTopics.length > 0
                            ? `${weakTopics.length} topic${weakTopics.length !== 1 ? 's' : ''} need attention`
                            : 'All topics above 60%'}
                    </div>
                </div>
                <div className={`weak-header-icon ${weakTopics.length > 0 ? 'icon-warning' : 'icon-success'}`}>
                    {weakTopics.length > 0 ? <Flame size={18} /> : <PartyPopper size={18} />}
                </div>
            </div>

            {weakTopics.length === 0 ? (
                <div className="weak-empty">
                    <div className="weak-empty-graphic">🎉</div>
                    <p className="weak-empty-title">All clear!</p>
                    <p className="weak-empty-sub">Every topic is above 60% mastery. Keep quizzing to push higher!</p>
                </div>
            ) : (
                <>
                    {/* Critical section */}
                    {criticalTopics.length > 0 && (
                        <div className="weak-section">
                            <div className="weak-section-label critical-label">
                                <Flame size={11} /> Critical — under 40%
                            </div>
                            {criticalTopics.map((topic, i) => (
                                <WeakItem key={topic.id || i} topic={topic} severity="critical" />
                            ))}
                        </div>
                    )}

                    {/* Weak section */}
                    {weakOnly.length > 0 && (
                        <div className="weak-section">
                            <div className="weak-section-label weak-label">
                                <AlertTriangle size={11} /> Needs Work — under 60%
                            </div>
                            {weakOnly.map((topic, i) => (
                                <WeakItem key={topic.id || i} topic={topic} severity="weak" />
                            ))}
                        </div>
                    )}

                    <Link to="/quiz" className="weak-cta">
                        Start a quiz on these topics <ArrowRight size={13} />
                    </Link>
                </>
            )}
        </div>
    );
}

function WeakItem({ topic, severity }) {
    const isCritical = severity === 'critical';
    const barColor   = isCritical ? '#EF4444' : '#F59E0B';
    const bgColor    = isCritical ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)';
    const borderColor = isCritical ? '#EF4444' : '#F59E0B';

    return (
        <div className="weak-item" style={{ background: bgColor, borderLeftColor: borderColor }}>
            <div className="weak-item-row">
                <div className="weak-item-dot" style={{ background: barColor }} />
                <span className="weak-item-name">{topic.name}</span>
                <span className="weak-item-score" style={{ color: barColor }}>{topic.mastery}%</span>
            </div>
            <div className="weak-bar-track">
                <div
                    className="weak-bar-fill"
                    style={{ width: `${topic.mastery}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}99)` }}
                />
            </div>
        </div>
    );
}
