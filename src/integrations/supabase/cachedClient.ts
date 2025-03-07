
import { createClient } from '@supabase/supabase-js';
import { 
  getCacheData, 
  setCacheData, 
  CACHE_DURATIONS, 
  clearCache,
  clearCacheByPrefix
} from '@/utils/cacheService';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Regular Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to clear Supabase cache
export const clearSupabaseCache = () => {
  clearCacheByPrefix('supabase:');
  console.log('Supabase cache cleared');
};

// Function to clear a specific table's cache
export const clearTableCache = (tableName: string) => {
  clearCacheByPrefix(`supabase:${tableName}`);
  console.log(`Cache for table ${tableName} cleared`);
};
