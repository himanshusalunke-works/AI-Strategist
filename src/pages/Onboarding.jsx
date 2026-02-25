import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Brain, GraduationCap, BookOpen, Target,
    Clock, ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import './Onboarding.css';

const BOARD_OPTIONS = [
    'CBSE', 'ICSE / ISC', 'IB (International Baccalaureate)', 'Cambridge (IGCSE / A-Level)',
    'State Board', 'University / UG', 'University / PG', 'Professional (CA / CS / CMA)',
    'Entrance Exam (JEE / NEET / UPSC / GATE)', 'Other',
];

const STUDY_LEVEL_OPTIONS = [
    'School – Class 8', 'School – Class 9', 'School – Class 10',
    'School – Class 11', 'School – Class 12',
    'Undergraduate – Year 1', 'Undergraduate – Year 2',
    'Undergraduate – Year 3', 'Undergraduate – Year 4',
    'Postgraduate', 'Doctoral', 'Professional Certification',
];

const LEARNING_STYLE_OPTIONS = [
    { label: 'Visual',           emoji: '👁️', desc: 'Diagrams, charts, videos' },
    { label: 'Auditory',         emoji: '🎧', desc: 'Lectures, discussions' },
    { label: 'Reading / Writing', emoji: '📝', desc: 'Notes, textbooks' },
    { label: 'Kinesthetic',      emoji: '🤲', desc: 'Practice, hands-on' },
    { label: 'Mixed',            emoji: '🔀', desc: 'A bit of everything' },
];

const STEPS = [
    { id: 'academics', label: 'Academics',   icon: GraduationCap },
    { id: 'exam',      label: 'Exam Goals',  icon: Target },
    { id: 'style',     label: 'Study Style', icon: BookOpen },
];

export default function Onboarding() {
    const { user, loading, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [step, setStep]     = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [form, setForm]     = useState({
        board:          '',
        university:     '',
        study_level:    '',
        target_exam:    '',
        target_year:    '',
        daily_hours:    '',
        learning_style: '',
    });

    // Auth guard: wait for Supabase session to settle, THEN check
    useEffect(() => {
        if (loading) return; // still resolving session — don't redirect yet
        if (!user) {
            navigate('/login', { replace: true });
        }
        // If user already completed onboarding, skip straight to dashboard
        if (user?.onboarding_complete) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    const set  = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const pick = (k, v) => setForm(f => ({ ...f, [k]: f[k] === v ? '' : v }));

    const canNext = () => {
        if (step === 0) return form.board && form.study_level;
        if (step === 1) return true; // all optional
        if (step === 2) return !!form.learning_style;
        return false;
    };

    const handleFinish = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await updateProfile({ ...form, onboarding_complete: true });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Onboarding save error:', err);
            setSaveError('Failed to save onboarding data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await updateProfile({ ...form, onboarding_complete: true });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Onboarding skip save error:', err);
            setSaveError('Could not complete onboarding right now. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Show a spinner while auth resolves (prevents flash before redirect)
    if (loading || !user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || '';

    return (
        <div className="ob-page">
            <div className="ob-glow ob-glow-1" />
            <div className="ob-glow ob-glow-2" />

            <div className="ob-card animate-scale">
                {/* Header */}
                <div className="ob-header">
                    <div className="ob-logo"><Brain size={28} /></div>
                    <div className="ob-header-text">
                        <h1>Welcome{firstName ? `, ${firstName}` : ''}! 👋</h1>
                        <p>Let's personalise your AI study experience in 3 quick steps.</p>
                    </div>
                </div>

                {/* Step progress */}
                <div className="ob-steps">
                    {STEPS.map((s, i) => {
                        const Icon  = s.icon;
                        const state = i < step ? 'done' : i === step ? 'active' : 'pending';
                        return (
                            <div key={s.id} className={`ob-step ob-step-${state}`}>
                                <div className="ob-step-circle">
                                    {state === 'done' ? '✓' : <Icon size={15} />}
                                </div>
                                <span className="ob-step-label">{s.label}</span>
                                {i < STEPS.length - 1 && (
                                    <div className={`ob-step-line ${i < step ? 'ob-line-done' : ''}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ---- Step 0: Academics ---- */}
                {step === 0 && (
                    <div className="ob-body animate-fade-in">
                        <h2 className="ob-step-title">Tell us about your education</h2>
                        <p className="ob-step-sub">We use this to tailor quizzes and schedules to your curriculum.</p>

                        <div className="ob-form-grid">
                            <div className="ob-field">
                                <label>Board / Curriculum <span className="ob-required">*</span></label>
                                <select className="input-field" value={form.board} onChange={set('board')}>
                                    <option value="">Select your board…</option>
                                    {BOARD_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div className="ob-field">
                                <label>Study Level <span className="ob-required">*</span></label>
                                <select className="input-field" value={form.study_level} onChange={set('study_level')}>
                                    <option value="">Select your level…</option>
                                    {STUDY_LEVEL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="ob-field ob-field-full">
                                <label>University / Institution <span className="ob-optional">(optional)</span></label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g. Delhi University, IIT Bombay"
                                    value={form.university}
                                    onChange={set('university')}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- Step 1: Exam Goals ---- */}
                {step === 1 && (
                    <div className="ob-body animate-fade-in">
                        <h2 className="ob-step-title">What are you preparing for?</h2>
                        <p className="ob-step-sub">Help the AI prioritise the right topics at the right intensity.</p>

                        <div className="ob-form-grid">
                            <div className="ob-field ob-field-full">
                                <label>Target Exam <span className="ob-optional">(optional)</span></label>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="e.g. JEE Advanced, NEET, UPSC, GATE, Board Exams"
                                    value={form.target_exam}
                                    onChange={set('target_exam')}
                                />
                            </div>

                            <div className="ob-field">
                                <label>Target Year <span className="ob-optional">(optional)</span></label>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="e.g. 2026"
                                    min="2025"
                                    max="2035"
                                    value={form.target_year}
                                    onChange={set('target_year')}
                                />
                            </div>

                            <div className="ob-field">
                                <label>
                                    <Clock size={14} className="ob-label-icon" />
                                    Daily Study Hours <span className="ob-optional">(optional)</span>
                                </label>
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="e.g. 4"
                                    min="1"
                                    max="16"
                                    value={form.daily_hours}
                                    onChange={set('daily_hours')}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ---- Step 2: Learning Style ---- */}
                {step === 2 && (
                    <div className="ob-body animate-fade-in">
                        <h2 className="ob-step-title">How do you learn best?</h2>
                        <p className="ob-step-sub">We'll adapt explanations and quiz formats to match your style.</p>

                        <div className="ob-style-grid">
                            {LEARNING_STYLE_OPTIONS.map(({ label, emoji, desc }) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={`ob-style-card ${form.learning_style === label ? 'ob-style-card-active' : ''}`}
                                    onClick={() => pick('learning_style', label)}
                                >
                                    <span className="ob-style-emoji">{emoji}</span>
                                    <span className="ob-style-label">{label}</span>
                                    <span className="ob-style-desc">{desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {saveError && (
                    <p className="ob-save-error" role="alert" aria-live="polite">
                        {saveError}
                    </p>
                )}

                {/* Footer */}
                <div className="ob-footer">
                    <button type="button" className="ob-skip-btn" onClick={handleSkip}>
                        Skip for now
                    </button>

                    <div className="ob-nav-btns">
                        {step > 0 && (
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setStep(s => s - 1)}
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                        )}

                        {step < STEPS.length - 1 ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!canNext()}
                                onClick={() => setStep(s => s + 1)}
                            >
                                Continue <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!canNext() || saving}
                                onClick={handleFinish}
                            >
                                {saving
                                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
                                    : <><Sparkles size={16} /> Start Learning</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
