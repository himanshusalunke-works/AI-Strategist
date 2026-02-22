import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast — a missing env var should never silently pass
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Persist session across browser restarts
        persistSession: true,
        // Auto-refresh the JWT before expiry
        autoRefreshToken: true,
        // Detect OAuth callback tokens in the URL hash
        detectSessionInUrl: true,
        // Namespace localStorage keys to avoid collisions
        storageKey: 'ai-strategist-auth',
    },
});
