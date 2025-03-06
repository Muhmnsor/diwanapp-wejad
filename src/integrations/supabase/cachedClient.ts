
import { supabase } from './client';
import { getCacheData, setCacheData, CACHE_DURATIONS, removeCacheData, clearCacheByPrefix } from '@/utils/cacheService';

/**
 * Smart Cached Supabase Client
 * Provides caching layer on top of Supabase for common read operations
 */

interface CacheOptions {
  enabled?: boolean;
  duration?: number;
  invalidateOnWrite?: boolean;
}

// Default cache options
const defaultCacheOptions: CacheOptions = {
  enabled: true,
  duration: CACHE_DURATIONS.MEDIUM,
  invalidateOnWrite: true
};

/**
 * Create cached version of Supabase select query
 * @param tableName - The table to query
 * @param query - The query function to execute
 * @param cacheOptions - Cache configuration options
 */
export const cachedSelect = async <T>(
  tableName: string,
  query: () => Promise<{ data: T | null; error: any }>,
  cacheOptions: CacheOptions = {}
): Promise<{ data: T | null; error: any; fromCache?: boolean }> => {
  const options = { ...defaultCacheOptions, ...cacheOptions };
  
  // Skip cache if disabled
  if (!options.enabled) {
    return query();
  }
  
  // Generate cache key from the query function
  const queryString = query.toString();
  const cacheKey = `supabase:${tableName}:${queryString.replace(/\s+/g, '')}`;
  
  // Try to get from cache first
  const cachedData = getCacheData<T>(cacheKey);
  if (cachedData) {
    return { data: cachedData, error: null, fromCache: true };
  }
  
  // Fetch from Supabase
  const { data, error } = await query();
  
  // Cache the result if valid
  if (!error && data) {
    setCacheData(cacheKey, data, options.duration);
  }
  
  return { data, error, fromCache: false };
};

/**
 * Execute write operation and invalidate related cache entries
 * @param tableName - The table being modified
 * @param operation - The write operation to perform
 */
export const cachedWrite = async <T>(
  tableName: string,
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  // Execute the write operation
  const result = await operation();
  
  // Invalidate cache for this table if no error
  if (!result.error) {
    clearCacheByPrefix(`supabase:${tableName}`);
  }
  
  return result;
};

/**
 * Cached Supabase client with the same API but with caching layer
 */
export const cachedSupabase = {
  from: (tableName: string) => {
    const originalBuilder = supabase.from(tableName);
    
    // Create a wrapper that preserves the original builder's methods
    // but adds caching capabilities
    return {
      // Preserve all original methods
      ...originalBuilder,
      
      // Override select with cached version
      select: (columns?: string) => {
        const selectBuilder = columns ? originalBuilder.select(columns) : originalBuilder.select();
        
        // Return a modified builder with cache capabilities
        return {
          ...selectBuilder, // This preserves all original builder methods like eq, order, etc.
          
          // Add caching method
          _cachedExecution: async <T>(
            cacheOptions?: CacheOptions
          ): Promise<{ data: T | null; error: any; fromCache?: boolean }> => {
            return cachedSelect<T>(
              tableName,
              () => selectBuilder as any,
              cacheOptions
            );
          }
        };
      }
    };
  }
};
