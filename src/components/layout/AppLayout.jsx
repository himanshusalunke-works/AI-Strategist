import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useState } from 'react';
import './AppLayout.css';

export default function AppLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                <TopBar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
                <main className="app-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
