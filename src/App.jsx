import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Quiz from './pages/Quiz';
import StudyPlan from './pages/StudyPlan';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function AuthRedirect({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={
                            <AuthRedirect><Login /></AuthRedirect>
                        } />
                        <Route path="/register" element={
                            <AuthRedirect><Register /></AuthRedirect>
                        } />

                        {/* Protected Routes */}
                        <Route element={
                            <ProtectedRoute><AppLayout /></ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="subjects" element={<Subjects />} />
                            <Route path="subjects/:id" element={<SubjectDetail />} />
                            <Route path="quiz" element={<Quiz />} />
                            <Route path="study-plan" element={<StudyPlan />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}
