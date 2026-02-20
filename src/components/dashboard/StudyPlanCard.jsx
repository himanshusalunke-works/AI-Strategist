import { useState } from 'react';
import { schedulesApi } from '../../lib/api';
import { generateScheduleLocally, generateScheduleWithAI } from '../../lib/scheduleGenerator';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Clock, BookOpen } from 'lucide-react';
import './StudyPlanCard.css';

export default function StudyPlanCard({ schedule, subject, topics, onRefresh }) {
    const [loading, setLoading] = useState(false);
    const [expandedDay, setExpandedDay] = useState(null);
    const [expandedReasons, setExpandedReasons] = useState({});

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Try AI generation first if key is available
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
            const scheduleData = apiKey
                ? await generateScheduleWithAI(topics, subject.exam_date, subject.daily_study_hours, apiKey)
                : generateScheduleLocally(topics, subject.exam_date, subject.daily_study_hours);

            await schedulesApi.save({
                subject_id: subject.id,
                schedule_data: scheduleData
            });
            onRefresh();
        } catch (error) {
            console.error('Schedule generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleReason = (dayKey, idx) => {
        const key = `${dayKey}-${idx}`;
        setExpandedReasons(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const days = schedule ? Object.entries(schedule) : [];

    return (
        <div className="card study-plan-card animate-fade-in stagger-4">
            <div className="card-header">
                <div>
                    <div className="card-title">
                        <Sparkles size={18} className="sparkle-icon" />
                        AI Study Plan
                    </div>
                    <div className="card-subtitle">
                        {schedule ? `${days.length}-day personalized schedule` : 'Generate your AI-powered study plan'}
                    </div>
                </div>
                <button
                    className={`btn ${schedule ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <><div className="spinner"></div> Generating...</>
                    ) : schedule ? (
                        <><RefreshCw size={14} /> Regenerate</>
                    ) : (
                        <><Sparkles size={14} /> Generate Plan</>
                    )}
                </button>
            </div>

            {!schedule ? (
                <div className="plan-empty">
                    <Sparkles size={40} className="plan-empty-icon" />
                    <h3>No Study Plan Yet</h3>
                    <p>Click "Generate Plan" to create a personalized, AI-optimized study schedule based on your topic mastery.</p>
                </div>
            ) : (
                <div className="plan-days">
                    {days.map(([dayKey, items], dayIdx) => (
                        <div key={dayKey} className="plan-day">
                            <button
                                className="plan-day-header"
                                onClick={() => setExpandedDay(expandedDay === dayKey ? null : dayKey)}
                            >
                                <div className="plan-day-label">
                                    <span className="plan-day-number">{dayKey}</span>
                                    <span className="plan-day-count">{items.length} topics · {items.reduce((s, i) => s + i.duration, 0)} min</span>
                                </div>
                                {expandedDay === dayKey ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {(expandedDay === dayKey || dayIdx < 2) && (
                                <div className="plan-day-items">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="plan-item">
                                            <div className="plan-item-main">
                                                <BookOpen size={14} className="plan-item-icon" />
                                                <span className="plan-item-topic">{item.topic}</span>
                                                <span className="plan-item-duration">
                                                    <Clock size={12} /> {item.duration} min
                                                </span>
                                            </div>
                                            <button
                                                className="plan-item-reason-toggle"
                                                onClick={() => toggleReason(dayKey, idx)}
                                            >
                                                {expandedReasons[`${dayKey}-${idx}`] ? 'Hide reason' : 'Why?'}
                                            </button>
                                            {expandedReasons[`${dayKey}-${idx}`] && (
                                                <div className="plan-item-reason animate-fade-in">
                                                    <Sparkles size={12} />
                                                    {item.reason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
