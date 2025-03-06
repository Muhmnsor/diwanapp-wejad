
import { supabase } from './client';
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { clearCacheByPrefix } from '@/utils/cacheService';

// Export cached supabase data fetching utilities
export const clearSupabaseCache = (tableName: string) => {
  return clearCacheByPrefix(`supabase:${tableName}`);
};

// Export the useCachedQuery hook for direct use
export { useCachedQuery };

// Export the raw supabase client for operations that shouldn't be cached
export { supabase };
