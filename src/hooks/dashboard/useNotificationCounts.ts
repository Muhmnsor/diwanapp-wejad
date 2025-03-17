
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export interface NotificationCounts {
  notifications: number;
  tasks: number;
  approval_requests: number;
  documents: number;
  meetings: number;
  [key: string]: number;
}

export const useNotificationCounts = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notification-counts', user?.id],
    queryFn: async (): Promise<NotificationCounts> => {
      if (!user) {
        return {
          notifications: 0,
          tasks: 0,
          approval_requests: 0,
          documents: 0,
          meetings: 0
        };
      }

      try {
        // Get unread notifications count
        const { count: notificationsCount, error: notificationsError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (notificationsError) {
          throw notificationsError;
        }

        // Get tasks count (you would customize this based on your schema)
        const { count: tasksCount, error: tasksError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assignee_id', user.id)
          .eq('status', 'pending');

        if (tasksError) {
          throw tasksError;
        }

        // Get approval requests count
        const { count: approvalsCount, error: approvalsError } = await supabase
          .from('request_approvals')
          .select('*', { count: 'exact', head: true })
          .eq('approver_id', user.id)
          .eq('status', 'pending');

        if (approvalsError) {
          throw approvalsError;
        }

        // Get documents pending review count
        const { count: documentsCount, error: documentsError } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('reviewer_id', user.id)
          .eq('status', 'pending_review');

        if (documentsError) {
          throw documentsError;
        }

        // Get meetings count that are upcoming and user is a participant
        const { count: meetingsCount, error: meetingsError } = await supabase
          .from('meeting_participants')
          .select('meeting_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['invited', 'confirmed']);

        if (meetingsError) {
          throw meetingsError;
        }

        return {
          notifications: notificationsCount || 0,
          tasks: tasksCount || 0,
          approval_requests: approvalsCount || 0,
          documents: documentsCount || 0,
          meetings: meetingsCount || 0
        };
      } catch (error) {
        console.error('Error fetching notification counts:', error);
        return {
          notifications: 0,
          tasks: 0,
          approval_requests: 0,
          documents: 0,
          meetings: 0
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user,
  });
};
