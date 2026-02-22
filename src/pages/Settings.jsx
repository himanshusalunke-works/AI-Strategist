import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Pencil, Save, CheckCircle, X } from 'lucide-react';
import './Settings.css';

const BOARD_OPTIONS = [
    'CBSE', 'ICSE / ISC', 'IB (International Baccalaureate)', 'Cambridge (IGCSE / A-Level)',
    'State Board', 'University / UG', 'University / PG', 'Professional (CA / CS / CMA)',
    'Entrance Exam (JEE / NEET / UPSC / GATE)', 'Other'
];

const STUDY_LEVEL_OPTIONS = [
    'School – Class 8', 'School – Class 9', 'School – Class 10',
    'School – Class 11', 'School – Class 12',
    'Undergraduate – Year 1', 'Undergraduate – Year 2',
    'Undergraduate – Year 3', 'Undergraduate – Year 4',
    'Postgraduate', 'Doctoral', 'Professional Certification'
];

const LEARNING_STYLE_OPTIONS = ['Visual', 'Auditory', 'Reading / Writing', 'Kinesthetic', 'Mixed'];

const GRADIENTS = [
    ['#4F46E5', '#06B6D4'],
    ['#7C3AED', '#EC4899'],
    ['#059669', '#06B6D4'],
    ['#DC2626', '#F59E0B'],
    ['#2563EB', '#7C3AED'],
];

export function getInitials(name, email) {
    if (name && name.trim()) {
        return name.trim().split(/\s+/).slice(0, 2).filter(w => w.length > 0).map(w => w[0].toUpperCase()).join('');
    }
    return (email || 'S').charAt(0).toUpperCase();
}
export function getAvatarGradient(letter) {
    const i = (letter.charCodeAt(0) || 0) % GRADIENTS.length;
    return `linear-gradient(135deg, ${GRADIENTS[i][0]}, ${GRADIENTS[i][1]})`;
}

// Defined at MODULE level — if it were inside Settings, React would treat it
// as a new component type on every render and unmount/remount the input,
// dropping focus after each keystroke.
function Field({ label, field, type = 'text', placeholder, children, editing, draft, onChange }) {
    return (
        <div className="settings-field">
            <label>{label}</label>
            {editing
                ? (children ?? <input className="input-field" type={type} value={draft[field]} onChange={onChange(field)} placeholder={placeholder} />)
                : <div className="settings-readonly">{draft[field] || <span className="settings-placeholder">Not set</span>}</div>
            }
        </div>
    );
}

export default function Settings() {
    const { user, updateProfile } = useAuth();
    const meta = user?.user_metadata || {};

    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        name: meta.name || '',
        board: meta.board || '',
        university: meta.university || '',
        study_level: meta.study_level || '',
        target_exam: meta.target_exam || '',
        target_year: meta.target_year || '',
        learning_style: meta.learning_style || '',
        daily_hours: meta.daily_hours || '',
    });
    const [draft, setDraft] = useState({ ...form });

    // Memoize avatar so it ONLY changes when saved form.name changes, not on draft keystrokes
    const initials = useMemo(() => getInitials(form.name, user?.email), [form.name, user?.email]);
    const gradient = useMemo(() => getAvatarGradient(initials[0] || 'S'), [initials]);

    const setField = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));
    const toggleChip = (k, v) => setDraft(d => ({ ...d, [k]: d[k] === v ? '' : v }));

    const handleEdit = () => { setDraft({ ...form }); setEditing(true); };
    const handleCancel = () => { setDraft({ ...form }); setEditing(false); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await updateProfile(draft);
            setForm({ ...draft });
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Your academic identity and AI preferences</p>
                </div>
            </div>

            {/* Hero Avatar — no animate-fade-in so it doesn't flicker on keystroke */}
            <div className="profile-hero card">
                <div className="profile-hero-bg" style={{ background: gradient }} />
                <div className="profile-hero-body">
                    <div className="profile-avatar" style={{ background: gradient }}>
                        {initials}
                    </div>
                    <div className="profile-hero-info">
                        <h2 className="profile-hero-name">{form.name || 'Student'}</h2>
                        <div className="profile-hero-meta">
                            <span className="profile-hero-tag"><Mail size={13} />{user?.email}</span>
                            {form.board && <span className="profile-hero-tag"><GraduationCap size={13} />{form.board}</span>}
                            {form.study_level && <span className="profile-hero-tag">{form.study_level}</span>}
                        </div>
                    </div>
                    <div className="profile-hero-actions">
                        {!editing
                            ? <button className="btn btn-primary" onClick={handleEdit}><Pencil size={15} /> Edit Profile</button>
                            : <>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={handleCancel}><X size={14} /> Cancel</button>
                                <button type="button" className="btn btn-primary btn-sm" disabled={isSaving} onClick={handleSave}>
                                    {isSaving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : <><Save size={14} /> Save</>}
                                </button>
                            </>
                        }
                        {saved && !editing && <span className="profile-saved-badge"><CheckCircle size={14} /> Saved!</span>}
                    </div>
                </div>
            </div>

            {/* Form — no animate classes to prevent animation on every keystroke */}
            <form onSubmit={handleSave}>
                <div className="card settings-card">
                    <div className="settings-card-header">
                        <GraduationCap size={20} color="var(--color-indigo)" />
                        <h3>Academic Profile</h3>
                    </div>

                    <div className="settings-grid-2">
                        <Field label="Full Name" field="name" placeholder="Your full name"
                            editing={editing} draft={draft} onChange={setField} />
                        <div className="settings-field">
                            <label>Email</label>
                            <div className="settings-readonly settings-readonly-muted">{user?.email}</div>
                        </div>

                        <div className="settings-section-divider settings-field-full">
                            <GraduationCap size={14} /> Academic Details
                        </div>

                        <Field label="Board / Curriculum" field="board"
                            editing={editing} draft={draft} onChange={setField}>
                            {editing && (
                                <select className="input-field" value={draft.board} onChange={setField('board')}>
                                    <option value="">Select board…</option>
                                    {BOARD_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            )}
                        </Field>

                        <Field label="University / Institution" field="university" placeholder="e.g. Delhi University"
                            editing={editing} draft={draft} onChange={setField} />

                        <Field label="Study Level" field="study_level"
                            editing={editing} draft={draft} onChange={setField}>
                            {editing && (
                                <select className="input-field" value={draft.study_level} onChange={setField('study_level')}>
                                    <option value="">Select level…</option>
                                    {STUDY_LEVEL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            )}
                        </Field>

                        <Field label="Target Exam" field="target_exam" placeholder="e.g. JEE Advanced, NEET"
                            editing={editing} draft={draft} onChange={setField} />

                        <Field label="Target Year" field="target_year" type="number" placeholder="e.g. 2026"
                            editing={editing} draft={draft} onChange={setField} />
                        <Field label="Daily Study Hours" field="daily_hours" type="number" placeholder="e.g. 4"
                            editing={editing} draft={draft} onChange={setField} />

                        <div className="settings-field settings-field-full">
                            <label>Preferred Learning Style</label>
                            {editing ? (
                                <div className="settings-chips">
                                    {LEARNING_STYLE_OPTIONS.map(s => (
                                        <button key={s} type="button"
                                            className={`settings-chip ${draft.learning_style === s ? 'settings-chip-active' : ''}`}
                                            onClick={() => toggleChip('learning_style', s)}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="settings-readonly">{form.learning_style || <span className="settings-placeholder">Not set</span>}</div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
