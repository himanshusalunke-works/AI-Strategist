import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Brain, Mail, Lock, User, ArrowRight, Sun, Moon, Home } from 'lucide-react';
import './Auth.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect appropriately
    if (!authLoading && user) {
        return <Navigate to={user.onboarding_complete ? '/dashboard' : '/onboarding'} replace />;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Bug 6 fix: basic strength check — at least 8 chars, 1 letter, 1 number
        if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password must be at least 8 characters and include a letter and a number.');
            setLoading(false);
            return;
        }

        try {
            const { error: authError } = await signUp({ email, password, name });
            if (authError) {
                setError(authError.message || 'Registration failed');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { theme, toggleTheme } = useTheme();

    return (
        <div className="auth-page">
            <div className="auth-bg-shapes">
                <div className="auth-shape auth-shape-1"></div>
                <div className="auth-shape auth-shape-2"></div>
                <div className="auth-shape auth-shape-3"></div>
            </div>

            {/* Top-right controls */}
            <div className="auth-top-controls">
                <Link to="/" className="auth-ctrl-btn" title="Back to Home">
                    <Home size={18} />
                </Link>
                <button className="auth-ctrl-btn" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>

            <div className="auth-container animate-scale">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Brain size={32} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Start your AI-powered study journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                id="name"
                                type="text"
                                className="input-field"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="Min 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? <div className="spinner"></div> : (
                            <>Create Account <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
