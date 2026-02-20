import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Key, User, Save, CheckCircle } from 'lucide-react';
import './Settings.css';

export default function Settings() {
    const { user } = useAuth();
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [saved, setSaved] = useState(false);

    const handleSaveApiKey = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            localStorage.setItem('gemini_api_key', apiKey.trim());
        } else {
            localStorage.removeItem('gemini_api_key');
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
                <div className="settings-field">
                    <label>Name</label>
                    <input className="input-field" value={user?.name || ''} readOnly />
                </div>
                <div className="settings-field">
                    <label>Email</label>
                    <input className="input-field" value={user?.email || ''} readOnly />
                </div>
            </div>

            {/* API Key Card */}
            <div className="card settings-card animate-fade-in stagger-2">
                <div className="settings-card-header">
                    <Key size={20} color="var(--color-teal)" />
                    <h3>AI Integration</h3>
                </div>
                <p className="settings-desc">
                    Add your Google Gemini API key to enable AI-powered schedule generation.
                    Without a key, schedules will be generated using a local algorithm.
                </p>
                <form onSubmit={handleSaveApiKey}>
                    <div className="settings-field">
                        <label>Gemini API Key</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter your Gemini API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                    <div className="settings-actions">
                        <button type="submit" className="btn btn-primary">
                            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Key</>}
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
