import { useState, useEffect } from 'react';
import { subjectsApi, topicsApi, schedulesApi } from '../lib/api';
import { generateScheduleLocally, generateScheduleWithAI } from '../lib/scheduleGenerator';
import { getDaysUntilExam } from '../lib/readiness';
import {
    Calendar, Clock, BookOpen, Sparkles, RefreshCw, ChevronRight, Info
} from 'lucide-react';
import './StudyPlan.css';

export default function StudyPlan() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [topics, setTopics] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const allSubjects = await subjectsApi.getAll();
                setSubjects(allSubjects);
                if (allSubjects.length > 0) {
                    await selectSubject(allSubjects[0]);
                }
            } catch (err) {
                console.error('Failed to load subjects:', err);
            } finally {
                setPageLoading(false);
            }
        };
        init();
    }, []);

    const selectSubject = async (subject) => {
        setSelectedSubject(subject);
        try {
            const subTopics = await topicsApi.getBySubject(subject.id);
            setTopics(subTopics);
            const sched = await schedulesApi.getBySubject(subject.id);
            if (sched?.schedule_data) {
                setSchedule(sched.schedule_data);
                const days = Object.keys(sched.schedule_data);
                setSelectedDay(days[0] || null);
            } else {
                setSchedule(null);
                setSelectedDay(null);
            }
        } catch (err) {
            console.error('Failed to load subject data:', err);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            const apiKey = localStorage.getItem('gemini_api_key') || '';
            const scheduleData = apiKey
                ? await generateScheduleWithAI(topics, selectedSubject.exam_date, selectedSubject.daily_study_hours, apiKey)
                : generateScheduleLocally(topics, selectedSubject.exam_date, selectedSubject.daily_study_hours);

            await schedulesApi.save({ subject_id: selectedSubject.id, schedule_data: scheduleData });
            setSchedule(scheduleData);
            const days = Object.keys(scheduleData);
            setSelectedDay(days[0] || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="study-plan-page">
                <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading study plan...</p>
                </div>
            </div>
        );
    }

    const days = schedule ? Object.entries(schedule) : [];
    const dayItems = selectedDay && schedule ? schedule[selectedDay] : [];

    return (
        <div className="study-plan-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Study Plan</h1>
                    <p className="page-subtitle">Your AI-generated study schedule</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={loading || !selectedSubject}
                >
                    {loading ? (
                        <><div className="spinner"></div> Generating...</>
                    ) : schedule ? (
                        <><RefreshCw size={16} /> Regenerate</>
                    ) : (
                        <><Sparkles size={16} /> Generate Plan</>
                    )}
                </button>
            </div>

            {/* Subject Tabs */}
            {subjects.length > 1 && (
                <div className="dashboard-subject-tabs" style={{ marginBottom: 24 }}>
                    {subjects.map(s => (
                        <button
                            key={s.id}
                            className={`subject-tab ${selectedSubject?.id === s.id ? 'subject-tab-active' : ''}`}
                            onClick={() => selectSubject(s)}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {!schedule ? (
                <div className="card empty-state" style={{ marginTop: 24 }}>
                    <Calendar size={48} />
                    <h3>No Study Plan Yet</h3>
                    <p>Generate an AI-powered study plan tailored to your topic mastery and exam date.</p>
                </div>
            ) : (
                <div className="study-plan-layout">
                    {/* Calendar Sidebar */}
                    <div className="plan-calendar-sidebar card">
                        <h3 className="plan-calendar-title">
                            <Calendar size={16} /> Schedule
                        </h3>
                        <div className="plan-calendar-days">
                            {days.map(([dayKey, items]) => (
                                <button
                                    key={dayKey}
                                    className={`plan-calendar-day ${selectedDay === dayKey ? 'plan-calendar-day-active' : ''}`}
                                    onClick={() => setSelectedDay(dayKey)}
                                >
                                    <span className="plan-cal-day-name">{dayKey}</span>
                                    <span className="plan-cal-day-info">
                                        {items.length} topics · {items.reduce((s, i) => s + i.duration, 0)} min
                                    </span>
                                    <ChevronRight size={14} />
                                </button>
                            ))}
                        </div>

                        {selectedSubject && (
                            <div className="plan-exam-info">
                                <Clock size={14} />
                                <span>{getDaysUntilExam(selectedSubject.exam_date)} days until exam</span>
                            </div>
                        )}
                    </div>

                    {/* Day Detail */}
                    <div className="plan-day-detail">
                        <div className="plan-day-detail-header">
                            <h2>{selectedDay || 'Select a day'}</h2>
                            {dayItems && (
                                <span className="plan-total-time">
                                    Total: {dayItems.reduce((s, i) => s + i.duration, 0)} min
                                </span>
                            )}
                        </div>

                        {dayItems && dayItems.map((item, idx) => (
                            <div key={idx} className="plan-detail-item card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="plan-detail-item-top">
                                    <div className="plan-detail-topic">
                                        <BookOpen size={18} className="plan-detail-icon" />
                                        <h3>{item.topic}</h3>
                                    </div>
                                    <div className="plan-detail-duration">
                                        <Clock size={14} />
                                        {item.duration} min
                                    </div>
                                </div>
                                <div className="plan-detail-reason">
                                    <Info size={14} />
                                    <span>{item.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
