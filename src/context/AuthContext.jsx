import { createContext, useContext, useState, useEffect } from 'react';
import { mockAuth } from '../lib/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const restored = mockAuth.restoreSession();
        if (restored) {
            setUser(restored);
        }
        setLoading(false);
    }, []);

    const signUp = async ({ email, password, name }) => {
        const { user: newUser, error } = mockAuth.signUp({ email, password, name });
        if (error) return { error };
        setUser(newUser);
        return { user: newUser };
    };

    const signIn = async ({ email, password }) => {
        const { user: loggedIn, error } = mockAuth.signIn({ email, password });
        if (error) return { error };
        setUser(loggedIn);
        return { user: loggedIn };
    };

    const signOut = async () => {
        mockAuth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
