
import { createClient } from '@supabase/supabase-js';
import { clearCache } from '@/utils/cacheService';

// Your Supabase URL and public anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced Supabase client with caching integrated
// TODO: Implement cached client if needed

// Function to clear all Supabase related cache
export const clearSupabaseCache = () => {
  clearCache('memory');
  clearCacheByPrefix('supabase:');
};
