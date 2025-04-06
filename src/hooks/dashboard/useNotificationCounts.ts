import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export interface NotificationCounts {
  notifications: number;
  tasks: number;
  approval_requests: number;
  documents: number;
  meetings: number;
  // Add the new notification types
  hr: number;
  accounting: number;
  internal_mail: number;
  subscriptions: number;
  ideas: number;
  finance: number;
  [key: string]: number;
}

const defaultCounts: NotificationCounts = {
  notifications: 0,
  tasks: 0,
  approval_requests: 0,
  documents: 0,
  meetings: 0,
  // Add default values for the new notification types
  hr: 0,
  accounting: 0,
  internal_mail: 0,
  subscriptions: 0,
  ideas: 0,
  finance: 0
};

export const useNotificationCounts = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['notification-counts', user?.id],
    queryFn: async (): Promise<NotificationCounts> => {
      console.log("Fetching notification counts for user:", user?.id);
      
      if (!user) {
        console.log("No user found, returning default counts");
        return defaultCounts;
      }

      try {
        // Get unread notifications count
        const { count: notificationsCount, error: notificationsError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (notificationsError) {
          console.error("Error fetching notifications count:", notificationsError);
          throw notificationsError;
        }

        // Get tasks count - Fixed: using assigned_to instead of assignee_id
        const { count: tasksCount, error: tasksError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .eq('status', 'pending');

        if (tasksError) {
          console.error("Error fetching tasks count:", tasksError);
          throw tasksError;
        }

        // Get approval requests count
        const { count: approvalsCount, error: approvalsError } = await supabase
          .from('request_approvals')
          .select('*', { count: 'exact', head: true })
          .eq('approver_id', user.id)
          .eq('status', 'pending');

        if (approvalsError) {
          console.error("Error fetching approvals count:", approvalsError);
          throw approvalsError;
        }

        // Get documents pending review count
        const { count: documentsCount, error: documentsError } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('reviewer_id', user.id)
          .eq('status', 'pending_review');

        if (documentsError) {
          console.error("Error fetching documents count:", documentsError);
          throw documentsError;
        }

        // Get meetings count that are upcoming and user is a participant
        const { count: meetingsCount, error: meetingsError } = await supabase
          .from('meeting_participants')
          .select('meeting_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['invited', 'confirmed']);

        if (meetingsError) {
          console.error("Error fetching meetings count:", meetingsError);
          throw meetingsError;
        }
        
        // New queries for the additional modules could be added here in the future
        // For now, we'll just use 0 as default values

        // Build the final result object
        const result: NotificationCounts = {
          notifications: notificationsCount || 0,
          tasks: tasksCount || 0,
          approval_requests: approvalsCount || 0,
          documents: documentsCount || 0,
          meetings: meetingsCount || 0,
          // Set default values for the new notification types
          hr: 0,
          accounting: 0, 
          internal_mail: 0,
          subscriptions: 0,
          ideas: 0,
          finance: 0
        };

        console.log("Successfully fetched notification counts:", result);

        return result;
      } catch (error) {
        console.error('Error fetching notification counts:', error);
        // Return default counts in case of error to prevent UI from breaking
        return defaultCounts;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user, // Only run query if user exists
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2, // Retry failed requests up to 2 times
  });
};
