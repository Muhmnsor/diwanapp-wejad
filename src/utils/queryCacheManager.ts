
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserSettings } from '@/store/userSettingsStore';
import { DeveloperSettings } from '@/types/developer.d';

// Default cache durations
const DEFAULT_CACHE_DURATION = 5; // 5 minutes

/**
 * Create a QueryClient with settings customized for the user
 */
export const createUserQueryClient = (
  userSettings?: UserSettings | null,
  developerSettings?: DeveloperSettings | null
): QueryClient => {
  // Use developer settings cache time if available, otherwise use default
  const cacheDuration = developerSettings?.cache_time_minutes || DEFAULT_CACHE_DURATION;
  
  // Determine if developer mode is enabled
  const devModeEnabled = developerSettings?.is_enabled || false;
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheDuration * 60 * 1000, // Convert minutes to milliseconds
        retry: devModeEnabled ? 0 : 1, // Disable retries in dev mode
        refetchOnWindowFocus: !devModeEnabled, // Disable auto refetch in dev mode
        refetchOnMount: !devModeEnabled, // Disable refetch on mount in dev mode
      },
    },
  });
  
  // Configure error handling based on developer settings
  configureErrorHandling(queryClient, developerSettings);
  
  return queryClient;
};

/**
 * Configure error handling for query and mutation errors
 */
const configureErrorHandling = (
  queryClient: QueryClient,
  developerSettings?: DeveloperSettings | null
): void => {
  // Configure debug level based on developer settings
  const debugLevel = developerSettings?.debug_level || 'error';
  const shouldShowToasts = !(developerSettings?.is_enabled || false);
  
  // Setup query cache subscription for error handling
  queryClient.getQueryCache().subscribe(() => {
    const failedQueries = queryClient.getQueryCache().findAll({ 
      predicate: query => query.state.status === 'error' 
    });
    
    if (failedQueries.length > 0) {
      // Log errors based on debug level
      if (debugLevel === 'debug' || debugLevel === 'info') {
        console.error('Query cache errors:', failedQueries);
      }
      
      // Show toast notifications if not in developer mode
      if (shouldShowToasts) {
        toast.error('حدث خطأ أثناء جلب البيانات');
      }
    }
  });
  
  // Setup mutation cache subscription for error handling
  queryClient.getMutationCache().subscribe(() => {
    const failedMutations = queryClient.getMutationCache().findAll({
      predicate: mutation => mutation.state.status === 'error'
    });
    
    if (failedMutations.length > 0) {
      // Log errors based on debug level
      if (debugLevel === 'debug' || debugLevel === 'info') {
        console.error('Mutation cache errors:', failedMutations);
      }
      
      // Show toast notifications if not in developer mode
      if (shouldShowToasts) {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      }
    }
  });
};
