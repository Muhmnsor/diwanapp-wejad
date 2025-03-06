
import { supabase } from "@/integrations/supabase/client";
import { throttle } from "./throttleUtils";

/**
 * Utility for chunking large database queries
 * Helps with pagination and performance optimization
 */

type ChunkOptions = {
  chunkSize?: number;
  delayBetweenChunks?: number;
  maxConcurrent?: number;
  onChunkProcessed?: (results: any[], chunkIndex: number) => void;
  onProgress?: (processed: number, total: number) => void;
  useCache?: boolean;
  cacheKeyPrefix?: string;
  cacheDuration?: number;
};

/**
 * Chunked fetch for large dataset queries
 * @param table Supabase table name 
 * @param query Base query function
 * @param options Chunking options
 */
export const fetchInChunks = async <T>(
  table: string,
  query: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>,
  options: ChunkOptions = {}
): Promise<T[]> => {
  const {
    chunkSize = 100,
    delayBetweenChunks = 200,
    maxConcurrent = 3,
    onChunkProcessed,
    onProgress,
    useCache = true,
    cacheKeyPrefix = 'chunk',
    cacheDuration = 60 * 5 * 1000 // 5 minutes
  } = options;

  // First determine the total count
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error(`Error determining count for ${table}:`, error);
    return [];
  }

  if (!count) return [];

  console.log(`Total items to fetch: ${count}`);
  
  // Calculate number of chunks
  const totalChunks = Math.ceil(count / chunkSize);
  let processedChunks = 0;
  const results: T[] = [];
  
  // Process chunks in batches to limit concurrency
  for (let batch = 0; batch < totalChunks; batch += maxConcurrent) {
    const batchPromises: Promise<T[]>[] = [];
    
    // Create a batch of promises
    for (
      let chunkIndex = batch;
      chunkIndex < Math.min(batch + maxConcurrent, totalChunks);
      chunkIndex++
    ) {
      const from = chunkIndex * chunkSize;
      const to = Math.min(from + chunkSize - 1, count - 1);
      
      batchPromises.push(
        fetchChunk<T>(table, query, from, to, chunkIndex, useCache, cacheKeyPrefix, cacheDuration)
      );
    }
    
    // Wait for the batch to complete
    const batchResults = await Promise.all(batchPromises);
    
    // Process batch results
    batchResults.forEach((chunkData, index) => {
      const chunkIndex = batch + index;
      results.push(...chunkData);
      processedChunks++;
      
      if (onChunkProcessed) {
        onChunkProcessed(chunkData, chunkIndex);
      }
      
      if (onProgress) {
        onProgress(processedChunks, totalChunks);
      }
    });
    
    // Add delay between batches to prevent overwhelming the database
    if (batch + maxConcurrent < totalChunks) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
    }
  }
  
  return results;
};

/**
 * Fetch a single chunk of data with caching
 */
async function fetchChunk<T>(
  table: string,
  query: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>,
  from: number,
  to: number,
  chunkIndex: number,
  useCache: boolean,
  cacheKeyPrefix: string,
  cacheDuration: number
): Promise<T[]> {
  // Check cache first if enabled
  if (useCache) {
    const cacheKey = `${cacheKeyPrefix}:${table}:${from}-${to}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const { data, timestamp } = parsed;
        
        // Check if cache is still valid
        if (timestamp && Date.now() - timestamp < cacheDuration) {
          console.log(`Using cached data for chunk ${chunkIndex} (${from}-${to})`);
          return data;
        }
      } catch (e) {
        // Invalid cache, proceed with fetch
        console.warn('Invalid cache data', e);
      }
    }
  }
  
  // Fetch data
  console.log(`Fetching chunk ${chunkIndex} (${from}-${to})`);
  const { data, error } = await query(from, to);
  
  if (error) {
    console.error(`Error fetching chunk ${chunkIndex}:`, error);
    return [];
  }
  
  // Store in cache if enabled
  if (useCache && data) {
    const cacheKey = `${cacheKeyPrefix}:${table}:${from}-${to}`;
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    } catch (e) {
      console.warn('Failed to cache chunk data', e);
    }
  }
  
  return data || [];
}

/**
 * Create a paginated query function for use with fetchInChunks
 */
export const createPaginatedQuery = <T>(
  table: string,
  options: {
    select?: string;
    order?: { column: string; ascending?: boolean };
    filter?: Record<string, any>;
  } = {}
) => {
  return (from: number, to: number): Promise<{ data: T[] | null; error: any }> => {
    const { select = '*', order, filter } = options;
    
    let query = supabase
      .from(table)
      .select(select)
      .range(from, to);
    
    // Apply ordering if specified
    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? true });
    }
    
    // Apply filters if specified
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    return query;
  };
};

/**
 * Create a throttled database updater to batch updates
 */
export const createBatchUpdater = <T>(
  table: string,
  options: {
    batchSize?: number;
    waitTime?: number;
    onSuccess?: (updatedIds: string[]) => void;
    onError?: (error: any) => void;
  } = {}
) => {
  const {
    batchSize = 20,
    waitTime = 500,
    onSuccess,
    onError
  } = options;
  
  const pendingUpdates: Record<string, Partial<T>> = {};
  
  const processUpdates = async () => {
    const entries = Object.entries(pendingUpdates);
    if (entries.length === 0) return;
    
    console.log(`Processing batch of ${entries.length} updates`);
    
    // Process in sub-batches if needed
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const updatePromises = batch.map(([id, data]) => 
        supabase
          .from(table)
          .update(data)
          .eq('id', id)
      );
      
      try {
        await Promise.all(updatePromises);
        
        // Clear processed items
        batch.forEach(([id]) => {
          delete pendingUpdates[id];
        });
        
        if (onSuccess) {
          onSuccess(batch.map(([id]) => id));
        }
      } catch (error) {
        console.error('Error processing batch updates:', error);
        if (onError) {
          onError(error);
        }
      }
    }
  };
  
  const throttledProcess = throttle(processUpdates, waitTime);
  
  return (id: string, data: Partial<T>) => {
    pendingUpdates[id] = { ...pendingUpdates[id], ...data };
    throttledProcess();
  };
};
