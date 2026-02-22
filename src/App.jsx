import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Quiz from './pages/Quiz';
import StudyPlan from './pages/StudyPlan';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';

// For public pages: if logged in → go to app dashboard
function AuthRedirect({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Landing — root for unauthenticated users */}
                        <Route path="/" element={
                            <AuthRedirect><Landing /></AuthRedirect>
                        } />

                        {/* Auth pages */}
                        <Route path="/login" element={
                            <AuthRedirect><Login /></AuthRedirect>
                        } />
                        <Route path="/register" element={
                            <AuthRedirect><Register /></AuthRedirect>
                        } />

                        {/* Onboarding — standalone public route, handles its own auth guard */}
                        <Route path="/onboarding" element={<Onboarding />} />

                        {/* Protected App Routes */}
                        <Route element={
                            <ProtectedRoute><AppLayout /></ProtectedRoute>
                        }>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="subjects" element={<Subjects />} />
                            <Route path="subjects/:id" element={<SubjectDetail />} />
                            <Route path="quiz" element={<Quiz />} />
                            <Route path="study-plan" element={<StudyPlan />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Catch all → landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}
