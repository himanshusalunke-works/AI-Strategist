import { useState, useEffect } from 'react';
import { subjectsApi, topicsApi, quizApi } from '../lib/api';
import { calculateReadiness } from '../lib/readiness';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, Legend, Area, AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Target } from 'lucide-react';
import './Analytics.css';

export default function Analytics() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [allAttempts, setAllAttempts] = useState([]);
    const [readiness, setReadiness] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
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
        init();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadSubjectData(selectedSubject.id);
        }
    }, [selectedSubject]);

    const loadSubjectData = async (subjectId) => {
        try {
            const [subTopics, attempts] = await Promise.all([
                topicsApi.getBySubject(subjectId),
                quizApi.getAllAttempts()
            ]);
            setTopics(subTopics);
            setAllAttempts(attempts);
            setReadiness(calculateReadiness(subTopics));
        } catch (err) {
            console.error('Failed to load analytics data:', err);
        }
    };

    if (loading) {
        return (
            <div className="analytics-page">
                <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!selectedSubject) return null;

    // Build chart data
    const topicMasteryData = topics.map(t => ({
        name: t.name.length > 12 ? t.name.substring(0, 12) + '…' : t.name,
        fullName: t.name,
        mastery: t.mastery_score
    }));

    // Accuracy over time (from attempts)
    const relevantTopicIds = topics.map(t => t.id);
    const relevantAttempts = allAttempts
        .filter(a => relevantTopicIds.includes(a.topic_id))
        .sort((a, b) => new Date(a.attempted_at) - new Date(b.attempted_at));

    const accuracyOverTime = relevantAttempts.map((a, i) => {
        const topic = topics.find(t => t.id === a.topic_id);
        return {
            attempt: i + 1,
            accuracy: a.accuracy,
            topic: topic?.name || 'Unknown',
            date: new Date(a.attempted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    });

    // Readiness trend (simulated from attempts)
    let runningReadiness = 20;
    const readinessTrend = accuracyOverTime.map((a, i) => {
        runningReadiness = Math.min(100, Math.max(0, runningReadiness + (a.accuracy - 50) * 0.3));
        return {
            attempt: i + 1,
            readiness: Math.round(runningReadiness),
            date: a.date
        };
    });

    // Radar data for topic comparison
    const radarData = topics.map(t => ({
        subject: t.name.length > 10 ? t.name.substring(0, 10) + '…' : t.name,
        mastery: t.mastery_score,
        fullMark: 100
    }));

    // Summary stats
    const totalAttempts = relevantAttempts.length;
    const avgAccuracy = totalAttempts > 0
        ? Math.round(relevantAttempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts)
        : 0;
    const strongTopics = topics.filter(t => t.mastery_score >= 80).length;
    const weakTopics = topics.filter(t => t.mastery_score < 60).length;

    // Read CSS custom properties for theme-aware chart colors
    const style = getComputedStyle(document.body);
    const chartGrid   = style.getPropertyValue('--border-card').trim() || '#E5E7EB';
    const chartTick   = style.getPropertyValue('--text-tertiary').trim() || '#9CA3AF';
    const chartTick2  = style.getPropertyValue('--text-secondary').trim() || '#6B7280';
    const chartBg     = style.getPropertyValue('--bg-card').trim() || '#ffffff';
    const chartBorder = style.getPropertyValue('--border-light').trim() || '#E5E7EB';
    const tooltipStyle = {
        borderRadius: 12,
        border: `1px solid ${chartBorder}`,
        background: chartBg,
        color: style.getPropertyValue('--text-primary').trim() || '#111827',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Track your study progress and performance</p>
                </div>
            </div>

            {subjects.length > 1 && (
                <div className="dashboard-subject-tabs" style={{ marginBottom: 24 }}>
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

            {/* Stats Cards */}
            <div className="analytics-stats">
                <div className="stat-card card animate-fade-in">
                    <div className="stat-icon stat-icon-indigo"><Target size={20} /></div>
                    <div className="stat-value">{readiness?.readinessScore || 0}%</div>
                    <div className="stat-label">Readiness</div>
                </div>
                <div className="stat-card card animate-fade-in stagger-1">
                    <div className="stat-icon stat-icon-teal"><Activity size={20} /></div>
                    <div className="stat-value">{avgAccuracy}%</div>
                    <div className="stat-label">Avg Accuracy</div>
                </div>
                <div className="stat-card card animate-fade-in stagger-2">
                    <div className="stat-icon stat-icon-green"><TrendingUp size={20} /></div>
                    <div className="stat-value">{strongTopics}</div>
                    <div className="stat-label">Strong Topics</div>
                </div>
                <div className="stat-card card animate-fade-in stagger-3">
                    <div className="stat-icon stat-icon-red"><BarChart3 size={20} /></div>
                    <div className="stat-value">{weakTopics}</div>
                    <div className="stat-label">Weak Topics</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="analytics-charts">
                {/* Readiness Trend */}
                <div className="card chart-card animate-fade-in stagger-2">
                    <div className="card-title">Readiness Trend</div>
                    <div className="card-subtitle">Overall readiness progression</div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={readinessTrend}>
                                <defs>
                                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTick }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTick }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="readiness" stroke="#4F46E5" fill="url(#readinessGrad)" strokeWidth={2.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Topic Mastery Bar Chart */}
                <div className="card chart-card animate-fade-in stagger-3">
                    <div className="card-title">Topic Mastery</div>
                    <div className="card-subtitle">Current mastery per topic</div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topicMasteryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: chartTick }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: chartTick2 }} width={100} />
                                <Tooltip
                                    formatter={(val) => [`${val}%`, 'Mastery']}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar
                                    dataKey="mastery"
                                    fill="#4F46E5"
                                    radius={[0, 6, 6, 0]}
                                    barSize={16}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Accuracy Over Time */}
                <div className="card chart-card animate-fade-in stagger-4">
                    <div className="card-title">Accuracy Over Time</div>
                    <div className="card-subtitle">Quiz performance by attempt</div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={accuracyOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTick }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTick }} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={(val, name, props) => [`${val}%`, props.payload.topic]}
                                />
                                <Line type="monotone" dataKey="accuracy" stroke="#06B6D4" strokeWidth={2} dot={{ r: 4, fill: '#06B6D4' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="card chart-card animate-fade-in stagger-5">
                    <div className="card-title">Topic Comparison</div>
                    <div className="card-subtitle">Radar view of strengths</div>
                    <div className="chart-container">
                        {radarData.length < 3 ? (
                            <div className="empty-state" style={{ height: 260 }}>
                                <p style={{ fontSize: '0.88rem' }}>Add at least 3 topics to see the radar chart.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke={chartGrid} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: chartTick2 }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chartTick }} tickCount={4} />
                                    <Radar
                                        name="Mastery"
                                        dataKey="mastery"
                                        stroke="#4F46E5"
                                        fill="#4F46E5"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}%`, 'Mastery']} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
