
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserSettings } from '@/types/userSettings';
import { DeveloperSettings } from '@/types/developer';

/**
 * Create a query client based on user settings
 */
export const createQueryClient = (
  userSettings: UserSettings | null = null,
  devSettings: DeveloperSettings | null = null
): QueryClient => {
  // Default cache duration of 5 minutes
  const cacheDuration = userSettings?.cache_duration_minutes || devSettings?.cache_time_minutes || 5;
  
  // Create a new query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheDuration * 60 * 1000, // Minutes to milliseconds
        gcTime: cacheDuration * 120 * 1000, // Twice the stale time
        retry: 1,
        refetchOnWindowFocus: false, // Disable by default, should be controlled by settings
      },
    },
  });
  
  // Set up error handling for TanStack Query v5
  queryClient.getQueryCache().subscribe(event => {
    if (event.type === 'error' && event.error) {
      const error = event.error as Error;
      
      // Log error for developers
      const isDeveloperMode = userSettings?.developer_mode || false;
      
      if (isDeveloperMode) {
        console.error('Query error:', error, event);
        toast.error(`خطأ في الاستعلام: ${error.message}`);
      } else {
        // Simplified error for users
        console.error('Query error:', error);
        toast.error(`حدث خطأ أثناء جلب البيانات`);
      }
    }
  });
  
  // Add mutation error handling
  queryClient.getMutationCache().subscribe(event => {
    if (event.type === 'error' && event.error) {
      const error = event.error as Error;
      
      // Log error for developers
      const isDeveloperMode = userSettings?.developer_mode || false;
      
      if (isDeveloperMode) {
        console.error('Mutation error:', error, event);
        toast.error(`خطأ في تحديث البيانات: ${error.message}`);
      } else {
        // Simplified error for users
        console.error('Mutation error:', error);
        toast.error(`حدث خطأ أثناء تحديث البيانات`);
      }
    }
  });
  
  return queryClient;
};

/**
 * Initialize query keys for caching
 */
export const initializeQueryKeys = () => {
  return {
    events: {
      all: ['events'],
      detail: (id: string) => ['events', id],
      registrations: (eventId: string) => ['events', eventId, 'registrations'],
      feedback: (eventId: string) => ['events', eventId, 'feedback'],
      stats: (eventId: string) => ['events', eventId, 'stats'],
    },
    users: {
      all: ['users'],
      detail: (id: string) => ['users', id],
      roles: ['users', 'roles'],
      permissions: (userId: string) => ['users', userId, 'permissions'],
    },
    finance: {
      all: ['finance'],
      expenses: ['finance', 'expenses'],
      resources: ['finance', 'resources'],
      targets: ['finance', 'targets'],
      reports: ['finance', 'reports'],
    },
  };
};
