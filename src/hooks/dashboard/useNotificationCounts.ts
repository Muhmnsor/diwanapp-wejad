
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotificationCounts {
  tasks: number;
  notifications: number;
  ideas: number;
  finance: number;
}

export const useNotificationCounts = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notification-counts'],
    queryFn: async () => {
      try {
        if (!user?.id) {
          console.log('No user ID available for notification counts');
          return {
            tasks: 0,
            notifications: 0,
            ideas: 0,
            finance: 0
          };
        }

        // Use Promise.allSettled to prevent one failing query from stopping others
        const results = await Promise.allSettled([
          // Portfolio tasks
          supabase
            .from('portfolio_tasks')
            .select('id', { count: 'exact' })
            .eq('assigned_to', user.id)
            .neq('status', 'completed'),
          
          // Regular tasks
          supabase
            .from('tasks')
            .select('id', { count: 'exact' })
            .eq('assigned_to', user.id)
            .neq('status', 'completed'),
          
          // Subtasks
          supabase
            .from('subtasks')
            .select('id', { count: 'exact' })
            .eq('assigned_to', user.id)
            .neq('status', 'completed'),
          
          // Notifications
          supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('is_read', false)
            .eq('user_id', user.id),
          
          // Ideas
          supabase
            .from('ideas')
            .select('id', { count: 'exact' })
            .eq('status', 'new'),
          
          // Financial resources
          supabase
            .from('financial_resources')
            .select('id', { count: 'exact' })
            .eq('status', 'pending')
        ]);

        // Log any errors for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Query ${index} failed:`, result.reason);
          }
        });

        // Safely extract counts
        const [portfolioTasks, regularTasks, subtasks, notifications, ideas, finance] = results;
        
        const portfolioTasksCount = portfolioTasks.status === 'fulfilled' ? portfolioTasks.value.data?.length || 0 : 0;
        const regularTasksCount = regularTasks.status === 'fulfilled' ? regularTasks.value.data?.length || 0 : 0;
        const subtasksCount = subtasks.status === 'fulfilled' ? subtasks.value.data?.length || 0 : 0;
        const notificationsCount = notifications.status === 'fulfilled' ? notifications.value.data?.length || 0 : 0;
        const ideasCount = ideas.status === 'fulfilled' ? ideas.value.data?.length || 0 : 0;
        const financeCount = finance.status === 'fulfilled' ? finance.value.data?.length || 0 : 0;

        const totalTasksCount = portfolioTasksCount + regularTasksCount + subtasksCount;

        return {
          tasks: totalTasksCount,
          notifications: notificationsCount,
          ideas: ideasCount,
          finance: financeCount
        };
      } catch (error) {
        console.error("Failed to fetch notification counts:", error);
        // Return default values on error instead of throwing
        return {
          tasks: 0,
          notifications: 0,
          ideas: 0,
          finance: 0
        };
      }
    },
    // Enable only if we have a user ID
    enabled: !!user?.id,
    // Provide default values
    initialData: {
      tasks: 0,
      notifications: 0,
      ideas: 0,
      finance: 0
    },
    // Add retry and stale time for better UX
    retry: 1,
    staleTime: 60 * 1000 // 1 minute
  });
};
