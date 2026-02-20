import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subjectsApi, topicsApi, schedulesApi } from '../lib/api';
import { calculateReadiness, getDaysUntilExam } from '../lib/readiness';
import ReadinessCard from '../components/dashboard/ReadinessCard';
import TopicMasteryCard from '../components/dashboard/TopicMasteryCard';
import WeakTopicsCard from '../components/dashboard/WeakTopicsCard';
import StudyPlanCard from '../components/dashboard/StudyPlanCard';
import {
    BookOpen, FileQuestion, Calendar, TrendingUp,
    Clock, Zap, Target, ArrowRight
} from 'lucide-react';
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
            <div className="dashboard-empty">
                <div className="dashboard-empty-card card animate-scale">
                    <div className="dashboard-empty-icon">🎓</div>
                    <h2>Welcome to AI Study Strategist</h2>
                    <p>Get started by adding your first subject to begin your personalized study journey.</p>
                    <Link to="/subjects" className="btn btn-primary btn-lg">
                        <BookOpen size={18} /> Add Your First Subject
                    </Link>
                </div>
            </div>
        );
    }

    const daysUntil = getDaysUntilExam(selectedSubject.exam_date);
    const totalTopics = topics.length;
    const masteredTopics = topics.filter(t => t.mastery_score >= 80).length;
    const weakTopics = topics.filter(t => t.mastery_score < 50).length;

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

            {/* Quick Stats Row */}
            <div className="dashboard-stats-row">
                <div className="stat-card stat-card-indigo animate-fade-in stagger-1">
                    <div className="stat-card-icon">
                        <Target size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{readiness?.readinessScore || 0}%</span>
                        <span className="stat-card-label">Readiness</span>
                    </div>
                </div>
                <div className="stat-card stat-card-teal animate-fade-in stagger-2">
                    <div className="stat-card-icon">
                        <Clock size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{daysUntil > 0 ? daysUntil : 0}</span>
                        <span className="stat-card-label">{daysUntil === 1 ? 'Day Left' : 'Days Left'}</span>
                    </div>
                </div>
                <div className="stat-card stat-card-green animate-fade-in stagger-3">
                    <div className="stat-card-icon">
                        <Zap size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{masteredTopics}/{totalTopics}</span>
                        <span className="stat-card-label">Mastered</span>
                    </div>
                </div>
                <div className="stat-card stat-card-orange animate-fade-in stagger-4">
                    <div className="stat-card-icon">
                        <TrendingUp size={20} />
                    </div>
                    <div className="stat-card-info">
                        <span className="stat-card-value">{weakTopics}</span>
                        <span className="stat-card-label">Need Focus</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-quick-actions">
                <Link to="/quiz" className="quick-action-btn">
                    <FileQuestion size={18} />
                    <span>Take a Quiz</span>
                    <ArrowRight size={14} />
                </Link>
                <Link to="/study-plan" className="quick-action-btn">
                    <Calendar size={18} />
                    <span>View Study Plan</span>
                    <ArrowRight size={14} />
                </Link>
                <Link to="/subjects" className="quick-action-btn">
                    <BookOpen size={18} />
                    <span>Manage Subjects</span>
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* Main Grid */}
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
