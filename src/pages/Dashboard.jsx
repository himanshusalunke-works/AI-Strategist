import { useState, useEffect } from 'react';
import { subjectsApi, topicsApi, schedulesApi } from '../lib/api';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSubjects = async () => {
            try {
                const allSubjects = await subjectsApi.getAll();
                setSubjects(allSubjects);
                if (allSubjects.length > 0) {
                    setSelectedSubject(allSubjects[0]);
                }
            } catch (err) {
                console.error('Failed to load subjects:', err);
            } finally {
                setLoading(false);
            }
        };
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadSubjectData(selectedSubject.id);
        }
    }, [selectedSubject]);

    const loadSubjectData = async (subjectId) => {
        try {
            const subTopics = await topicsApi.getBySubject(subjectId);
            setTopics(subTopics);
            setReadiness(calculateReadiness(subTopics));
            const sched = await schedulesApi.getBySubject(subjectId);
            setSchedule(sched?.schedule_data || null);
        } catch (err) {
            console.error('Failed to load subject data:', err);
        }
    };

    const refreshData = () => {
        if (selectedSubject) {
            loadSubjectData(selectedSubject.id);
        }
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

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
