
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask, TaskStatus } from "@/types/meeting";
import { toast } from "sonner";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";

export interface UpdateTaskData {
  id: string;
  meeting_id: string;
  updates: Partial<Omit<MeetingTask, 'id' | 'meeting_id' | 'created_at' | 'updated_at'>>;
}

export const useUpdateMeetingTask = () => {
  const queryClient = useQueryClient();
  const { sendTaskAssignmentNotification } = useTaskAssignmentNotifications();
  
  return useMutation({
    mutationFn: async ({ id, updates, meeting_id }: UpdateTaskData & { meeting_id: string }) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
      
      // If assigned_to has been updated, send a notification
      if (updates.assigned_to) {
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
              taskId: id,
              taskTitle: data.title,
              assignedUserId: updates.assigned_to,
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
      toast.success('تم تحديث المهمة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', variables.meeting_id] });
    },
    onError: (error) => {
      console.error('Error in task update:', error);
      toast.error('حدث خطأ أثناء تحديث المهمة');
    }
  });
};

// Helper function to quickly update task status
export const useUpdateTaskStatus = () => {
  const updateTask = useUpdateMeetingTask();
  
  const updateStatus = (taskId: string, meetingId: string, status: TaskStatus) => {
    return updateTask.mutate({
      id: taskId,
      meeting_id: meetingId,
      updates: { status }
    });
  };
  
  return {
    updateStatus,
    isLoading: updateTask.isPending
  };
};
