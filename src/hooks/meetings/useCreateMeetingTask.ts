
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask } from "@/types/meeting";
import { toast } from "sonner";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";

export interface CreateTaskData {
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: 'action_item' | 'follow_up' | 'decision' | 'other';
}

export const useCreateMeetingTask = () => {
  const queryClient = useQueryClient();
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
  
  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .insert([{
          ...taskData,
          status: 'pending'
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }
      
      // Send notification if task is assigned to someone
      if (taskData.assigned_to) {
        try {
          // Get current user info
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // Get user's display name or email
            const { data: creatorProfile } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', user.id)
              .single();

            const creatorName = creatorProfile?.display_name || creatorProfile?.email || user.email || 'مستخدم';

            // Send the notification
            await sendTaskAssignmentNotification({
              taskId: data.id,
              taskTitle: taskData.title,
              assignedUserId: taskData.assigned_to,
              assignedByUserId: user.id,
              assignedByUserName: creatorName
            });
          }
        } catch (notifyError) {
          console.error('Error sending task assignment notification:', notifyError);
        }
      }
      
      return data as MeetingTask;
    },
    onSuccess: (_, variables) => {
      toast.success('تم إضافة المهمة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', variables.meeting_id] });
    },
    onError: (error) => {
      console.error('Error in task creation:', error);
      toast.error('حدث خطأ أثناء إضافة المهمة');
    }
  });
};
