import { Link } from 'react-router-dom';
import { getStatusColor, getStatusLabel } from '../../lib/readiness';
import { BarChart3, ArrowRight } from 'lucide-react';
import './TopicMasteryCard.css';

const COLOR_MAP = {
    green:  { bar: 'linear-gradient(90deg, #22C55E, #4ADE80)', bg: 'rgba(34,197,94,0.1)',  text: '#22C55E' },
    orange: { bar: 'linear-gradient(90deg, #F59E0B, #FCD34D)', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
    red:    { bar: 'linear-gradient(90deg, #EF4444, #F87171)', bg: 'rgba(239,68,68,0.1)',   text: '#EF4444' },
};

export default function TopicMasteryCard({ topics }) {
    if (!topics || topics.length === 0) {
        return (
            <div className="card topic-mastery-card">
                <div className="card-header">
                    <div className="card-title">Topic Mastery</div>
                </div>
                <div className="mastery-empty">
                    <BarChart3 size={32} color="var(--text-tertiary)" />
                    <p>No topics added yet</p>
                    <Link to="/subjects" className="btn btn-primary btn-sm">Add Topics</Link>
                </div>
            </div>
        );
    }

    // Sort: weakest first so they get immediate attention
    const sorted = [...topics].sort((a, b) => a.mastery - b.mastery);

    return (
        <div className="card topic-mastery-card animate-fade-in stagger-2">
            <div className="card-header">
                <div>
                    <div className="card-title">Topic Mastery</div>
                    <div className="card-subtitle">{topics.length} topic{topics.length !== 1 ? 's' : ''} tracked</div>
                </div>
                <div className="mastery-header-icon">
                    <BarChart3 size={18} />
                </div>
            </div>

            {/* Legend */}
            <div className="mastery-legend">
                {[['green','Strong'],['orange','Moderate'],['red','Weak']].map(([c, l]) => (
                    <span key={c} className="mastery-legend-item">
                        <span className="mastery-legend-dot" style={{ background: COLOR_MAP[c].text }} />
                        {l}
                    </span>
                ))}
            </div>

            <div className="mastery-list">
                {sorted.map((topic, i) => {
                    const colorKey = getStatusColor(topic.mastery);
                    const colors   = COLOR_MAP[colorKey] || COLOR_MAP.red;
                    return (
                        <div
                            key={topic.id || i}
                            className="mastery-item"
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            <div className="mastery-item-header">
                                <span className="mastery-topic-name">{topic.name}</span>
                                <div className="mastery-item-right">
                                    <span
                                        className="mastery-badge"
                                        style={{ background: colors.bg, color: colors.text }}
                                    >
                                        {getStatusLabel(topic.mastery)}
                                    </span>
                                    <span className="mastery-percent" style={{ color: colors.text }}>
                                        {topic.mastery}%
                                    </span>
                                </div>
                            </div>
                            <div className="mastery-bar-track">
                                <div
                                    className="mastery-bar-fill"
                                    style={{
                                        width: `${topic.mastery}%`,
                                        background: colors.bar,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <Link
                to={`/quiz?topicId=${encodeURIComponent(sorted[0].id)}&topicName=${encodeURIComponent(sorted[0].name)}`}
                className="mastery-cta"
            >
                Practice weak topics <ArrowRight size={13} />
            </Link>
        </div>
    );
}
