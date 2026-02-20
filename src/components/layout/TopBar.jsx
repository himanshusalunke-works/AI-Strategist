import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getGreeting, getDaysUntilExam } from '../../lib/readiness';
import { subjectsApi } from '../../lib/api';
import { getInitials, getAvatarGradient } from '../../pages/Settings';
import { Clock, Bell, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import './TopBar.css';

export default function TopBar({ onMenuToggle }) {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);
    const [subjects, setSubjects] = useState([]);

    // Avatar — memoized so it only recalculates when user metadata changes
    const meta = user?.user_metadata || {};
    const avatarInitials = useMemo(() => getInitials(meta.name, user?.email), [meta.name, user?.email]);
    const avatarGradient = useMemo(() => getAvatarGradient(avatarInitials[0] || 'S'), [avatarInitials]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock notifications
    const mockNotifications = [
        { id: 1, title: 'Calculus Quiz Available', time: '10m ago', read: false },
        { id: 2, title: 'Study Goal Reached!', time: '1h ago', read: false },
        { id: 3, title: 'New Physics Topic Unlocked', time: '2h ago', read: true }
    ];

    // Fetch active subjects for exam countdown
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!user) return;
            try {
                const data = await subjectsApi.getAll();
                setSubjects(data);
            } catch (err) {
                console.error("Failed to load subjects for TopBar:", err);
            }
        };
        fetchSubjects();
    }, [user]);

    // Find nearest upcoming exam
    let nearestExam = null;
    let daysUntil = Infinity;
    subjects.forEach(s => {
        const d = getDaysUntilExam(s.exam_date);
        // Only consider exam dates that haven't passed
        if (d >= 0 && d < daysUntil) {
            daysUntil = d;
            nearestExam = s;
        }
    });

    const greeting = getGreeting();
    const userName = user?.name || user?.email?.split('@')[0] || 'Student';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button className="topbar-menu-btn" onClick={onMenuToggle}>
                    <Menu size={20} />
                </button>
                <div className="topbar-greeting">
                    <h2>{greeting}, <span className="topbar-name">{userName}</span> 👋</h2>
                    <p className="topbar-subtitle">Let's make progress today!</p>
                </div>
            </div>

            <div className="topbar-right">
                {nearestExam && (
                    <div className="topbar-exam-badge">
                        <Clock size={14} />
                        <span>
                            {daysUntil > 0
                                ? `Exam in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`
                                : 'Exam day!'}
                        </span>
                    </div>
                )}
                <button 
                    className="topbar-icon-btn theme-toggle" 
                    aria-label="Toggle Theme"
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <div className="topbar-notification-wrapper" ref={notificationsRef}>
                    <button 
                        className="topbar-icon-btn" 
                        aria-label="Notifications"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={18} />
                        <span className="notification-dot"></span>
                    </button>
                    
                    {showNotifications && (
                        <div className="notification-dropdown animate-fade-in">
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                <button className="close-btn" onClick={() => setShowNotifications(false)}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="notification-list">
                                {mockNotifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                                        <div className="notification-content">
                                            <p className="notification-title">{notif.title}</p>
                                            <span className="notification-time">{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="notification-footer">
                                <button className="mark-all-read">Mark all as read</button>
                            </div>
                        </div>
                    )}
                </div>
                <div
                    className="topbar-avatar"
                    style={{ background: avatarGradient }}
                    title={meta.name || user?.email || 'Profile'}
                >
                    {avatarInitials}
                </div>
            </div>
        </header>
    );
}
