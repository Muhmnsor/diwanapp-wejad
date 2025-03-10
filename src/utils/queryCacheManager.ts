
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserSettings } from '@/types/userSettings';

let queryClient: QueryClient | null = null;

/**
 * Initialize and configure the QueryClient with the user's settings
 */
export const initializeQueryClient = async (userSettings: UserSettings | null): Promise<QueryClient> => {
  // Create a new QueryClient if it doesn't exist
  if (!queryClient) {
    const isDeveloper = userSettings?.developer_mode || false;
    const cacheDuration = userSettings?.cache_duration_minutes || 5;
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: cacheDuration * 60 * 1000,
          retry: isDeveloper ? 0 : 1,
          refetchOnWindowFocus: !isDeveloper,
          refetchOnMount: !isDeveloper,
        },
      },
    });
    
    // Configure global error handling for React Query v5
    queryClient.getQueryCache().subscribe(event => {
      if (event.type === 'updated' && event.query.state.status === 'error') {
        const error = event.query.state.error;
        console.error('Query cache error in QueryManager:', error);
        toast.error('حدث خطأ أثناء جلب البيانات');
      }
    });
    
    // Add observer for performance monitoring if in developer mode
    if (isDeveloper) {
      queryClient.getQueryCache().subscribe(event => {
        if (event.type === 'updated' && event.query.state.status === 'success') {
          const fetchStartTime = event.query.state.fetchMeta?.fetchTime;
          const fetchEndTime = event.query.state.dataUpdatedAt;
          
          if (fetchStartTime && fetchEndTime) {
            const queryTime = fetchEndTime - fetchStartTime;
            
            if (typeof queryTime === 'number' && queryTime > 500) {
              const queryKeyStr = Array.isArray(event.query.queryKey) ? event.query.queryKey.join('.') : String(event.query.queryKey);
              console.log(`Query ${queryKeyStr} completed in ${queryTime}ms`);
              logSlowQuery(queryKeyStr, queryTime);
            }
          }
        }
      });
    }
  }
  
  return queryClient;
};

// Log slow queries for debugging
const logSlowQuery = async (queryKey: string, queryTime: number) => {
  try {
    await supabase.from('developer_query_logs').insert({
      query_key: queryKey,
      execution_time_ms: queryTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log slow query:', error);
  }
};

/**
 * Get the existing QueryClient or create a new one
 */
export const getOrCreateQueryClient = (): QueryClient => {
  if (!queryClient) {
    queryClient = new QueryClient();
  }
  return queryClient;
};

/**
 * Reset the QueryClient
 */
export const resetQueryClient = (): void => {
  if (queryClient) {
    queryClient.clear();
    queryClient = null;
  }
};
