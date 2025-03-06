
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
    
    return {
      ...originalBuilder,
      
      // Override select with cached version
      select: (columns?: string) => {
        const selectBuilder = columns ? originalBuilder.select(columns) : originalBuilder.select();
        
        // Return a modified builder with cache capabilities
        return {
          ...selectBuilder,
          
          // Cache the final execution
          _cachedExecution: async <T>(
            cacheOptions?: CacheOptions
          ): Promise<{ data: T | null; error: any; fromCache?: boolean }> => {
            return cachedSelect<T>(
              tableName,
              () => selectBuilder as any,
              cacheOptions
            );
          },
          
          // Override execution methods with cached versions
          async then<TResult1, TResult2>(
            onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
          ): Promise<TResult1 | TResult2> {
            const { data, error } = await cachedSelect(
              tableName,
              () => selectBuilder as any
            );
            
            const result = { data, error };
            return onfulfilled ? onfulfilled(result) : (result as any);
          },
        };
      },
      
      // Override insert with cache invalidation
      insert: (values: any) => {
        const insertBuilder = originalBuilder.insert(values);
        
        return {
          ...insertBuilder,
          async then<TResult1, TResult2>(
            onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
          ): Promise<TResult1 | TResult2> {
            const result = await cachedWrite(
              tableName,
              () => insertBuilder as any
            );
            
            return onfulfilled ? onfulfilled(result) : (result as any);
          }
        };
      },
      
      // Override update with cache invalidation
      update: (values: any) => {
        const updateBuilder = originalBuilder.update(values);
        
        return {
          ...updateBuilder,
          async then<TResult1, TResult2>(
            onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
          ): Promise<TResult1 | TResult2> {
            const result = await cachedWrite(
              tableName,
              () => updateBuilder as any
            );
            
            return onfulfilled ? onfulfilled(result) : (result as any);
          }
        };
      },
      
      // Override delete with cache invalidation
      delete: () => {
        const deleteBuilder = originalBuilder.delete();
        
        return {
          ...deleteBuilder,
          async then<TResult1, TResult2>(
            onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
          ): Promise<TResult1 | TResult2> {
            const result = await cachedWrite(
              tableName,
              () => deleteBuilder as any
            );
            
            return onfulfilled ? onfulfilled(result) : (result as any);
          }
        };
      }
    };
  }
};
