import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Save, CheckCircle } from 'lucide-react';
import './Settings.css';

export default function Settings() {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await updateProfile({ name });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="card settings-card animate-fade-in">
                <div className="settings-card-header">
                    <User size={20} color="var(--color-indigo)" />
                    <h3>Profile</h3>
                </div>
                <form onSubmit={handleSaveProfile}>
                    <div className="settings-field">
                        <label>Name</label>
                        <input 
                            className="input-field" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Your name"
                        />
                    </div>
                    <div className="settings-field">
                        <label>Email</label>
                        <input className="input-field" value={user?.email || ''} readOnly disabled style={{background: 'var(--bg-page)', cursor: 'not-allowed'}} />
                    </div>
                    <div className="settings-actions" style={{ marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <><div className="spinner"></div> Saving...</> : 
                             saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Profile</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* About */}
            <div className="card settings-card animate-fade-in stagger-3">
                <div className="settings-card-header">
                    <SettingsIcon size={20} color="var(--color-indigo)" />
                    <h3>About</h3>
                </div>
                <p className="settings-desc">
                    <strong>AI Study Strategist</strong> — MVP v1.0<br />
                    An adaptive, AI-powered exam preparation platform that tracks topic-level performance,
                    calculates readiness, and generates personalized study schedules.
                </p>
            </div>
        </div>
    );
}
