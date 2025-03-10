
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const getQueryClient = (userIsDeveloper: boolean = false, cacheDuration: number = 5) => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheDuration * 60 * 1000, // Convert minutes to milliseconds
        retry: 1,
        refetchOnWindowFocus: !userIsDeveloper, // Disable refetch on window focus for developers
        refetchOnMount: !userIsDeveloper, // Disable refetch on mount for developers
      },
    },
    queryCache: {
      onError: (error) => {
        console.error('Query cache error:', error);
        toast.error('حدث خطأ أثناء جلب البيانات');
      },
    }
  });
};

/**
 * Helper to invalidate queries based on selective invalidation
 */
export const invalidateQueries = async (
  queryClient: QueryClient, 
  queryKeys: string | string[], 
  exactMatch: boolean = false
) => {
  const keys = Array.isArray(queryKeys) ? queryKeys : [queryKeys];
  
  try {
    await Promise.all(
      keys.map(key => 
        queryClient.invalidateQueries({ 
          queryKey: [key],
          exact: exactMatch
        })
      )
    );
    return true;
  } catch (error) {
    console.error('Error invalidating queries:', error);
    return false;
  }
};

/**
 * Clear specific query data or all cache if no key provided
 */
export const clearQueryCache = (queryClient: QueryClient, queryKey?: string | string[]) => {
  try {
    if (queryKey) {
      const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
      keys.forEach(key => {
        queryClient.removeQueries({ queryKey: [key] });
      });
      console.log('Cleared query cache for keys:', keys);
    } else {
      queryClient.clear();
      console.log('Cleared entire query cache');
    }
    return true;
  } catch (error) {
    console.error('Error clearing query cache:', error);
    return false;
  }
};

/**
 * Helper to prefetch queries for better UX
 */
export const prefetchQueries = async (
  queryClient: QueryClient,
  queryConfigs: Array<{
    queryKey: string | string[];
    queryFn: () => Promise<any>;
    staleTime?: number;
  }>
) => {
  try {
    await Promise.all(
      queryConfigs.map(({ queryKey, queryFn, staleTime }) => 
        queryClient.prefetchQuery({
          queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
          queryFn,
          staleTime
        })
      )
    );
    return true;
  } catch (error) {
    console.error('Error prefetching queries:', error);
    return false;
  }
};
