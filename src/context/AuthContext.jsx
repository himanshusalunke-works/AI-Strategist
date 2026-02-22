import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Defined outside component — no recreation on every render (Bug 7 fix)
async function fetchProfile(userId) {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return data || {};
}

function buildUser(authUser, profile = {}) {
    return {
        id:    authUser.id,
        email: authUser.email,
        name:  profile.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        user_metadata: authUser.user_metadata || {},
        board:               profile.board               || '',
        study_level:         profile.study_level         || '',
        university:          profile.university          || '',
        target_exam:         profile.target_exam         || '',
        target_year:         profile.target_year         || '',
        daily_hours:         profile.daily_hours         || '',
        learning_style:      profile.learning_style      || '',
        onboarding_complete: profile.onboarding_complete || false,
    };
}

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Bug 2 fix: onAuthStateChange is the SINGLE source of truth.
        // It fires INITIAL_SESSION on mount — no need for a separate getSession() call.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(session.user.id);
                    setUser(buildUser(session.user, profile));
                } else {
                    setUser(null); // Bug 4 fix: state reset driven by auth event, not manual call
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async ({ email, password, name }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });
        if (error) return { error };
        // Bug 5 fix: don't fetch profile right after signup — DB trigger may not have
        // run yet. Build user from auth response; onAuthStateChange will hydrate the
        // full profile once the trigger completes and the session fires SIGNED_IN.
        if (data.user) {
            setUser(buildUser(data.user, { name }));
        }
        return { user: data.user };
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        // onAuthStateChange fires SIGNED_IN and handles setUser — no need to call it here.
        // But we return user so callers can react immediately.
        return { user: data.user };
    };

    const signOut = async () => {
        // Bug 4 fix: don't manually call setUser(null).
        // onAuthStateChange fires SIGNED_OUT → sets user to null automatically.
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const updateProfile = async (updates) => {
        if (!user) throw new Error('Not authenticated');

        const profileFields = {
            name:                updates.name               ?? user.name,
            board:               updates.board              ?? user.board,
            study_level:         updates.study_level        ?? user.study_level,
            university:          updates.university         ?? user.university,
            target_exam:         updates.target_exam        ?? user.target_exam,
            target_year:         updates.target_year        ? Number(updates.target_year) : (user.target_year || null),
            daily_hours:         updates.daily_hours        ? Number(updates.daily_hours) : (user.daily_hours || null),
            learning_style:      updates.learning_style     ?? user.learning_style,
            onboarding_complete: updates.onboarding_complete ?? user.onboarding_complete,
        };

        // Optimistic local update first — UI reflects changes instantly
        setUser(prev => ({
            ...prev,
            ...profileFields,
            user_metadata: { ...(prev.user_metadata || {}), name: profileFields.name },
        }));

        // Fire both network calls in parallel instead of sequentially
        const [{ error: profileError }] = await Promise.all([
            supabase.from('profiles').upsert({ id: user.id, ...profileFields }, { onConflict: 'id' }),
            supabase.auth.updateUser({ data: { name: profileFields.name } }),
        ]);
        if (profileError) throw profileError;
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
