import { useState, useEffect } from 'react';
import { mockSubjects, mockTopics, mockSchedules } from '../lib/mockData';
import { calculateReadiness, getDaysUntilExam } from '../lib/readiness';
import ReadinessCard from '../components/dashboard/ReadinessCard';
import TopicMasteryCard from '../components/dashboard/TopicMasteryCard';
import WeakTopicsCard from '../components/dashboard/WeakTopicsCard';
import StudyPlanCard from '../components/dashboard/StudyPlanCard';
import './Dashboard.css';

export default function Dashboard() {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [readiness, setReadiness] = useState(null);
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        const allSubjects = mockSubjects.getAll();
        setSubjects(allSubjects);
        if (allSubjects.length > 0) {
            setSelectedSubject(allSubjects[0]);
        }
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            const subTopics = mockTopics.getBySubject(selectedSubject.id);
            setTopics(subTopics);
            setReadiness(calculateReadiness(subTopics));
            const sched = mockSchedules.getBySubject(selectedSubject.id);
            setSchedule(sched?.schedule_data || null);
        }
    }, [selectedSubject]);

    const refreshData = () => {
        if (selectedSubject) {
            const subTopics = mockTopics.getBySubject(selectedSubject.id);
            setTopics(subTopics);
            setReadiness(calculateReadiness(subTopics));
            const sched = mockSchedules.getBySubject(selectedSubject.id);
            setSchedule(sched?.schedule_data || null);
        }
    };

    if (!selectedSubject) {
        return (
            <div className="empty-state">
                <h3>No subjects yet</h3>
                <p>Add a subject to get started with your study plan.</p>
            </div>
        );
    }

    const daysUntil = getDaysUntilExam(selectedSubject.exam_date);

    return (
        <div className="dashboard">
            {/* Subject Selector */}
            {subjects.length > 1 && (
                <div className="dashboard-subject-tabs">
                    {subjects.map(s => (
                        <button
                            key={s.id}
                            className={`subject-tab ${selectedSubject?.id === s.id ? 'subject-tab-active' : ''}`}
                            onClick={() => setSelectedSubject(s)}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div className="dashboard-grid">
                <div className="dashboard-col-left">
                    <ReadinessCard
                        score={readiness?.readinessScore || 0}
                        daysUntil={daysUntil}
                        coverage={readiness?.coverage || 0}
                        avgAccuracy={readiness?.avgAccuracy || 0}
                    />
                    <WeakTopicsCard weakTopics={readiness?.weakTopics || []} />
                </div>
                <div className="dashboard-col-right">
                    <TopicMasteryCard topics={readiness?.topicBreakdown || []} />
                </div>
            </div>

            {/* Study Plan - Full Width */}
            <StudyPlanCard
                schedule={schedule}
                subject={selectedSubject}
                topics={topics}
                onRefresh={refreshData}
            />
        </div>
    );
}
