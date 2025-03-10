
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: pendingPortfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select('id', { count: 'exact' })
        .eq('assigned_to', user?.id)
        .neq('status', 'completed');

      const { data: pendingRegularTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('assigned_to', user?.id)
        .neq('status', 'completed');

      const { data: pendingSubtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('id', { count: 'exact' })
        .eq('assigned_to', user?.id)
        .neq('status', 'completed');

      if (portfolioError || tasksError || subtasksError) {
        console.error("Error fetching tasks counts:", 
          portfolioError || tasksError || subtasksError
        );
      }

      const totalPendingTasks = 
        (pendingPortfolioTasks?.length || 0) + 
        (pendingRegularTasks?.length || 0) + 
        (pendingSubtasks?.length || 0);

      const { data: unreadNotifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .eq('user_id', user?.id);

      const { data: newIdeas, error: ideasError } = await supabase
        .from('ideas')
        .select('id', { count: 'exact' })
        .eq('status', 'new');

      const { data: pendingFinance, error: financeError } = await supabase
        .from('financial_resources')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (tasksError || notificationsError || ideasError || financeError) {
        console.error("Error fetching notification counts:", tasksError || notificationsError || ideasError || financeError);
      }

      return {
        tasks: totalPendingTasks,
        notifications: unreadNotifications?.length || 0,
        ideas: newIdeas?.length || 0,
        finance: pendingFinance?.length || 0,
      };
    },
    initialData: {
      tasks: 0,
      notifications: 0,
      ideas: 0,
      finance: 0
    }
  });
};
