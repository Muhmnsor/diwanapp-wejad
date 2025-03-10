
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserSettings } from '@/types/userSettings';

/**
 * Creates and configures a QueryClient with the appropriate settings
 */
export const createQueryClient = (userSettings: UserSettings | null): QueryClient => {
  const isDeveloper = userSettings?.developer_mode || false;
  const cacheDuration = userSettings?.cache_duration_minutes || 5;
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheDuration * 60 * 1000, // Convert minutes to milliseconds
        retry: isDeveloper ? 0 : 1, // Disable retry for developers
        refetchOnWindowFocus: !isDeveloper,
        refetchOnMount: !isDeveloper,
      },
    },
  });

  // Setup global error handler
  queryClient.getQueryCache().subscribe({
    onError: (error) => {
      console.error('Query error:', error);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    }
  });

  return queryClient;
};

/**
 * Configures real-time invalidation for a QueryClient
 */
export const setupQueryInvalidation = (
  queryClient: QueryClient,
  tables: string[],
  invalidateKeys: Record<string, string[]>
): void => {
  // In a real implementation, this would use Supabase's realtime feature
  // to invalidate specific queries when database changes occur
  
  queryClient.getQueryCache().subscribe({
    onError: (error) => {
      console.error('Query invalidation error:', error);
    }
  });
};

/**
 * Utility to clear cache for specific tables
 */
export const clearTableCache = (queryClient: QueryClient, tables: string[]): void => {
  tables.forEach(table => {
    queryClient.invalidateQueries({ queryKey: [table] });
  });
  toast.success('تم مسح ذاكرة التخزين المؤقت');
};
