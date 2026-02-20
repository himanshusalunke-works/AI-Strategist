import { useAuth } from '../../context/AuthContext';
import { getGreeting, getDaysUntilExam } from '../../lib/readiness';
import { mockSubjects } from '../../lib/mockData';
import { Clock, Bell, User, Menu } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ onMenuToggle }) {
    const { user } = useAuth();
    const subjects = mockSubjects.getAll();

    // Find nearest exam
    let nearestExam = null;
    let daysUntil = Infinity;
    subjects.forEach(s => {
        const d = getDaysUntilExam(s.exam_date);
        if (d < daysUntil) {
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
                <button className="topbar-icon-btn" aria-label="Notifications">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </button>
                <div className="topbar-avatar">
                    <User size={18} />
                </div>
            </div>
        </header>
    );
}
