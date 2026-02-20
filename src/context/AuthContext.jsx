import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
                });
            }
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || ''
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async ({ email, password, name }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) return { error };
        if (data.user) {
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || name || ''
            });
        }
        return { user: data.user };
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) return { error };
        if (data.user) {
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
            });
        }
        return { user: data.user };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
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
