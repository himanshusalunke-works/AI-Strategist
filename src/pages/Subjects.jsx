import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subjectsApi } from '../lib/api';
import { getDaysUntilExam } from '../lib/readiness';
import {
    Plus, BookOpen, Calendar, Clock, Trash2, Edit2, X
} from 'lucide-react';
import './Subjects.css';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', exam_date: '', daily_study_hours: 3 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await subjectsApi.getAll();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await subjectsApi.update(editingId, form);
            } else {
                await subjectsApi.create(form);
            }
            await loadSubjects();
            resetForm();
        } catch (err) {
            console.error('Failed to save subject:', err);
        }
    };

    const handleEdit = (subject) => {
        setForm({ name: subject.name, exam_date: subject.exam_date, daily_study_hours: subject.daily_study_hours });
        setEditingId(subject.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this subject and all its topics?')) {
            try {
                await subjectsApi.delete(id);
                await loadSubjects();
            } catch (err) {
                console.error('Failed to delete subject:', err);
            }
        }
    };

    const resetForm = () => {
        setForm({ name: '', exam_date: '', daily_study_hours: 3 });
        setEditingId(null);
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="spinner"></div>
                <p>Loading subjects...</p>
            </div>
        );
    }

    return (
        <div className="subjects-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Subjects</h1>
                    <p className="page-subtitle">Manage your subjects and exam preparation</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Subject
                </button>
            </div>

            {subjects.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} />
                    <h3>No Subjects Yet</h3>
                    <p>Add your first subject to start tracking your exam preparation.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Subject
                    </button>
                </div>
            ) : (
                <div className="subjects-grid">
                    {subjects.map((subject, i) => {
                        const daysLeft = getDaysUntilExam(subject.exam_date);
                        return (
                            <div key={subject.id} className="subject-card card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="subject-card-top">
                                    <div className="subject-icon-wrapper">
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="subject-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(subject)}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(subject.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <Link to={`/subjects/${subject.id}`} className="subject-card-body">
                                    <h3 className="subject-name">{subject.name}</h3>
                                    <div className="subject-meta">
                                        <div className="subject-meta-item">
                                            <Calendar size={14} />
                                            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Exam passed'}</span>
                                        </div>
                                        <div className="subject-meta-item">
                                            <Clock size={14} />
                                            <span>{subject.daily_study_hours}h / day</span>
                                        </div>
                                    </div>
                                </Link>

                                <div className="subject-card-footer">
                                    <Link to={`/subjects/${subject.id}`} className="btn btn-secondary btn-sm w-full">
                                        View Topics →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId ? 'Edit Subject' : 'Add Subject'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={resetForm}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Subject Name</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Physics, Mathematics"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Exam Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={form.exam_date}
                                    onChange={e => setForm({ ...form, exam_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Daily Study Hours</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="16"
                                    value={form.daily_study_hours}
                                    onChange={e => setForm({ ...form, daily_study_hours: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Subject'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
