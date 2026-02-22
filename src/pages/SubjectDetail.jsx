import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subjectsApi, topicsApi } from '../lib/api';
import { getStatusColor, getStatusLabel, getDaysUntilExam } from '../lib/readiness';
import {
    ArrowLeft, Plus, Trash2, Edit2, X, BookOpen, FileQuestion, Calendar
} from 'lucide-react';
import './SubjectDetail.css';

export default function SubjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [topicName, setTopicName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            // Fetch subject and its topics in parallel
            const [s, t] = await Promise.all([
                subjectsApi.getById(id),
                topicsApi.getBySubject(id),
            ]);
            if (!s) { navigate('/subjects'); return; }
            setSubject(s);
            setTopics(t);
        } catch (err) {
            console.error('Failed to load subject:', err);
            navigate('/subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await topicsApi.update(editingId, { name: topicName });
            } else {
                await topicsApi.create({ subject_id: id, name: topicName });
            }
            const t = await topicsApi.getBySubject(id);
            setTopics(t);
            resetForm();
        } catch (err) {
            console.error('Failed to save topic:', err);
        }
    };

    const handleEdit = (topic) => {
        setTopicName(topic.name);
        setEditingId(topic.id);
        setShowModal(true);
    };

    const handleDelete = async (topicId) => {
        if (confirm('Delete this topic?')) {
            try {
                await topicsApi.delete(topicId);
                const t = await topicsApi.getBySubject(id);
                setTopics(t);
            } catch (err) {
                console.error('Failed to delete topic:', err);
            }
        }
    };

    const resetForm = () => {
        setTopicName('');
        setEditingId(null);
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Loading subject...</p>
            </div>
        );
    }

    if (!subject) return null;

    const daysLeft = getDaysUntilExam(subject.exam_date);

    return (
        <div className="subject-detail-page">
            <div className="detail-back">
                <Link to="/subjects" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={16} /> Back to Subjects
                </Link>
            </div>

            <div className="detail-header">
                <div>
                    <h1 className="page-title">{subject.name}</h1>
                    <div className="detail-meta">
                        <span className="detail-meta-item">
                            <Calendar size={14} /> {daysLeft > 0 ? `${daysLeft} days until exam` : 'Exam passed'}
                        </span>
                        <span className="detail-meta-item">
                            <BookOpen size={14} /> {topics.length} topics
                        </span>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Topic
                </button>
            </div>

            {topics.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} />
                    <h3>No Topics Yet</h3>
                    <p>Add topics to this subject to start tracking mastery.</p>
                </div>
            ) : (
                <div className="topics-list">
                    {topics.map((topic, i) => (
                        <div key={topic.id} className="topic-row card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="topic-row-left">
                                <div className="topic-row-name">{topic.name}</div>
                                <div className="topic-row-mastery">
                                    <div className="progress-bar-track" style={{ width: 120 }}>
                                        <div
                                            className={`progress-bar-fill progress-${getStatusColor(topic.mastery_score)}`}
                                            style={{ width: `${topic.mastery_score}%` }}
                                        />
                                    </div>
                                    <span className={`badge badge-${getStatusColor(topic.mastery_score)}`}>
                                        {topic.mastery_score}% · {getStatusLabel(topic.mastery_score)}
                                    </span>
                                </div>
                            </div>
                            <div className="topic-row-actions">
                                <Link
                                    to={`/quiz?topicId=${topic.id}&topicName=${encodeURIComponent(topic.name)}`}
                                    className="btn btn-secondary btn-sm"
                                >
                                    <FileQuestion size={14} /> Quiz
                                </Link>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(topic)}>
                                    <Edit2 size={14} />
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(topic.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId ? 'Edit Topic' : 'Add Topic'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Topic Name</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Thermodynamics, Calculus"
                                    value={topicName}
                                    onChange={e => setTopicName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save' : 'Add Topic'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
