import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Defined outside component - no recreation on every render.
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!session?.user) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // USER_UPDATED fires when supabase.auth.updateUser() is called (e.g. from
                // updateProfile). We already applied an optimistic setUser in updateProfile,
                // so skip the profile fetch round-trip here and sync auth metadata only.
                if (event === 'USER_UPDATED') {
                    setUser(prev => prev ? {
                        ...prev,
                        email: session.user.email,
                        user_metadata: session.user.user_metadata || {},
                    } : prev);
                    setLoading(false);
                    return;
                }

                // INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, etc. - fetch full profile.
                const profile = await fetchProfile(session.user.id);
                setUser(buildUser(session.user, profile));
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

        // Do not fetch profile immediately after signup; DB trigger may not have run yet.
        if (data.user) {
            setUser(buildUser(data.user, { name }));
        }
        return { user: data.user };
    };

    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        return { user: data.user };
    };

    const signOut = async () => {
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

        const prevUser = user;

        // Optimistic local update first so UI updates immediately.
        setUser(prev => ({
            ...prev,
            ...profileFields,
            user_metadata: { ...(prev.user_metadata || {}), name: profileFields.name },
        }));

        const [profileRes, authRes] = await Promise.all([
            supabase.from('profiles').upsert({ id: user.id, ...profileFields }, { onConflict: 'id' }),
            supabase.auth.updateUser({ data: { name: profileFields.name } }),
        ]);

        const profileError = profileRes?.error || null;
        const authError = authRes?.error || null;

        if (profileError || authError) {
            setUser(prevUser);
            throw (profileError || authError);
        }
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
