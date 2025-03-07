
import { supabase } from '@/integrations/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Efficient chunked data loading utilities
 */

interface ChunkOptions<T> {
  chunkSize?: number;
  totalLimit?: number;
  page?: number;
  sortField?: keyof T;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
  searchTerm?: string;
  searchFields?: (keyof T)[];
}

/**
 * Load data in chunks with pagination, sorting, and filtering support
 * @returns Promise with data array and total count
 */
export async function loadDataInChunks<T extends Record<string, any>>(
  tableName: string,
  options: ChunkOptions<T> = {}
): Promise<{ data: T[]; error: any; count: number }> {
  const {
    chunkSize = 50,
    totalLimit = 1000,
    page = 1,
    sortField,
    sortOrder = 'asc',
    filter = {},
    searchTerm = '',
    searchFields = []
  } = options;

  // Calculate pagination
  const from = (page - 1) * chunkSize;
  const to = from + chunkSize - 1;

  try {
    // Start building the query
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply search if provided
    if (searchTerm && searchFields.length > 0) {
      const searchQueries = searchFields.map(field => {
        return `${String(field)}.ilike.%${searchTerm}%`;
      });
      
      query = query.or(searchQueries.join(','));
    }

    // Apply sorting
    if (sortField) {
      query = query.order(String(sortField), { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(from, to);

    // Execute the query and convert it to a proper Promise
    const { data, error, count } = await query;

    return {
      data: (data || []) as T[],
      error,
      count: count || 0
    };
  } catch (error) {
    console.error('Error loading data in chunks:', error);
    return { data: [], error, count: 0 };
  }
}

/**
 * Progressive loading function that loads data in incremental chunks
 * and processes each chunk as it arrives
 */
export async function progressiveLoad<T extends Record<string, any>>(
  tableName: string,
  onChunkLoaded: (chunk: T[], progress: number) => void,
  options: ChunkOptions<T> & {
    onComplete?: (allData: T[]) => void;
    onError?: (error: any) => void;
    delayBetweenChunks?: number;
  } = {}
): Promise<T[]> {
  const {
    chunkSize = 50,
    totalLimit = 1000,
    sortField,
    sortOrder = 'asc',
    filter = {},
    delayBetweenChunks = 300,
    onComplete,
    onError
  } = options;

  const allData: T[] = [];
  let currentPage = 1;
  let hasMoreData = true;
  let loadedCount = 0;
  let totalCount = 0;

  try {
    // Load first chunk and get total count
    const firstChunkResult = await loadDataInChunks<T>(tableName, {
      ...options,
      page: currentPage,
      chunkSize
    });

    if (firstChunkResult.error) {
      throw firstChunkResult.error;
    }

    totalCount = Math.min(firstChunkResult.count, totalLimit);
    
    if (firstChunkResult.data.length > 0) {
      allData.push(...firstChunkResult.data);
      loadedCount += firstChunkResult.data.length;
      
      const progress = Math.min(100, (loadedCount / totalCount) * 100);
      onChunkLoaded(firstChunkResult.data, progress);
    } else {
      hasMoreData = false;
    }

    // Continue loading chunks if needed
    while (hasMoreData && loadedCount < totalLimit && loadedCount < totalCount) {
      currentPage++;
      
      // Optional delay between chunk loads to prevent UI blocking
      if (delayBetweenChunks > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }

      const chunkResult = await loadDataInChunks<T>(tableName, {
        ...options,
        page: currentPage,
        chunkSize
      });

      if (chunkResult.error) {
        throw chunkResult.error;
      }

      if (chunkResult.data.length > 0) {
        allData.push(...chunkResult.data);
        loadedCount += chunkResult.data.length;
        
        const progress = Math.min(100, (loadedCount / totalCount) * 100);
        onChunkLoaded(chunkResult.data, progress);
      } else {
        hasMoreData = false;
      }

      // Stop if we've reached the limit
      if (loadedCount >= totalLimit) {
        break;
      }
    }

    // Call completion callback
    if (onComplete) {
      onComplete(allData);
    }

    return allData;
  } catch (error) {
    console.error('Error in progressive loading:', error);
    if (onError) {
      onError(error);
    }
    return allData;
  }
}

/**
 * Execute a Supabase query with proper type handling and Promise conversion
 */
export async function executeQuery<T>(
  query: PostgrestFilterBuilder<any, any, any, any, any>
): Promise<{ data: T[]; error: any; }> {
  try {
    // Execute the query to get a proper Promise
    const { data, error } = await query;
    return { data: (data || []) as T[], error };
  } catch (error) {
    console.error('Error executing query:', error);
    return { data: [], error };
  }
}
