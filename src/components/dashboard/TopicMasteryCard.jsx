import { getStatusColor, getStatusLabel } from '../../lib/readiness';
import { BarChart3 } from 'lucide-react';
import './TopicMasteryCard.css';

export default function TopicMasteryCard({ topics }) {
    if (!topics || topics.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Topic Mastery</div>
                </div>
                <p className="card-subtitle">No topics added yet</p>
            </div>
        );
    }

    return (
        <div className="card topic-mastery-card animate-fade-in stagger-2">
            <div className="card-header">
                <div>
                    <div className="card-title">Topic Mastery</div>
                    <div className="card-subtitle">{topics.length} topics tracked</div>
                </div>
                <BarChart3 size={20} color="var(--color-indigo)" />
            </div>

            <div className="mastery-list">
                {topics.map((topic, i) => (
                    <div key={topic.id || i} className="mastery-item" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="mastery-item-header">
                            <span className="mastery-topic-name">{topic.name}</span>
                            <div className="mastery-item-right">
                                <span className={`badge badge-${getStatusColor(topic.mastery)}`}>
                                    {getStatusLabel(topic.mastery)}
                                </span>
                                <span className="mastery-percent">{topic.mastery}%</span>
                            </div>
                        </div>
                        <div className="progress-bar-track">
                            <div
                                className={`progress-bar-fill progress-${getStatusColor(topic.mastery)}`}
                                style={{ width: `${topic.mastery}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
