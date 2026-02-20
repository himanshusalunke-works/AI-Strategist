import { AlertTriangle } from 'lucide-react';
import './WeakTopicsCard.css';

export default function WeakTopicsCard({ weakTopics }) {
    return (
        <div className="card weak-topics-card animate-fade-in stagger-3">
            <div className="card-header">
                <div>
                    <div className="card-title">Priority Focus Areas</div>
                    <div className="card-subtitle">Topics below 60% mastery</div>
                </div>
                <AlertTriangle size={20} color="var(--color-orange)" />
            </div>

            {weakTopics.length === 0 ? (
                <div className="weak-empty">
                    <span className="weak-empty-icon">🎉</span>
                    <p>All topics above 60%! Great work!</p>
                </div>
            ) : (
                <div className="weak-list">
                    {weakTopics.map((topic, i) => (
                        <div key={topic.id || i} className="weak-item">
                            <div className="weak-item-icon">
                                <AlertTriangle size={14} />
                            </div>
                            <div className="weak-item-info">
                                <span className="weak-item-name">{topic.name}</span>
                                <span className="weak-item-score">{topic.mastery}%</span>
                            </div>
                            <div className="progress-bar-track weak-progress">
                                <div
                                    className="progress-bar-fill progress-red"
                                    style={{ width: `${topic.mastery}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
