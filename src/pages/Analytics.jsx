import { useState, useEffect } from 'react';
import { mockSubjects, mockTopics, mockQuiz } from '../lib/mockData';
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

    useEffect(() => {
        const allSubjects = mockSubjects.getAll();
        setSubjects(allSubjects);
        if (allSubjects.length > 0) setSelectedSubject(allSubjects[0]);
    }, []);

    if (!selectedSubject) return null;

    const topics = mockTopics.getBySubject(selectedSubject.id);
    const readiness = calculateReadiness(topics);
    const allAttempts = mockQuiz.getAllAttempts();

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
                    <div className="stat-value">{readiness.readinessScore}%</div>
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                />
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={100} />
                                <Tooltip
                                    formatter={(val) => [`${val}%`, 'Mastery']}
                                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }}
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }}
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
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                <Radar
                                    name="Mastery"
                                    dataKey="mastery"
                                    stroke="#4F46E5"
                                    fill="#4F46E5"
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
