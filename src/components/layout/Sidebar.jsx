import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    FileQuestion,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Brain,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/quiz', icon: FileQuestion, label: 'Quiz' },
    { to: '/study-plan', icon: Calendar, label: 'Study Plan' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }) {
    const { signOut } = useAuth();

    const handleNavClick = () => {
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <>
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={onMobileClose} />
            )}

            <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        <div className="sidebar-logo">
                            <div className="logo-icon">
                                <Brain size={24} />
                            </div>
                            {!collapsed && <span className="logo-text">AI Strategist</span>}
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                            }
                            title={collapsed ? item.label : undefined}
                            onClick={handleNavClick}
                        >
                            <span className="sidebar-icon"><item.icon size={20} /></span>
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="sidebar-link sidebar-logout"
                        onClick={signOut}
                        title={collapsed ? 'Log Out' : undefined}
                    >
                        <span className="sidebar-icon"><LogOut size={20} /></span>
                        {!collapsed && <span>Log Out</span>}
                    </button>
                    {!collapsed && (
                        <div className="sidebar-version">AI Strategist · v1.0</div>
                    )}
                </div>
                </div>

                <button
                    className="sidebar-toggle"
                    onClick={onToggleCollapse}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>
        </>
    );
}
