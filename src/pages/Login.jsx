import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: authError } = await signIn({ email, password });
            if (authError) {
                setError(authError.message || 'Invalid credentials');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-shapes">
                <div className="auth-shape auth-shape-1"></div>
                <div className="auth-shape auth-shape-2"></div>
                <div className="auth-shape auth-shape-3"></div>
            </div>

            <div className="auth-container animate-scale">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Brain size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your study journey</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

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
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? <div className="spinner"></div> : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
                </p>
            </div>
        </div>
    );
}
