import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Client for regular operations (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for service operations (uses service role key)
export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Helper function to get user from JWT token
export async function getUserFromToken(token: string) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
}

// Helper function to verify JWT token
export async function verifyToken(token: string) {
    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        return data.user;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
