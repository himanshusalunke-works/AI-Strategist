import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User } from 'lucide-react';
import './Settings.css';

export default function Settings() {
    const { user } = useAuth();

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
