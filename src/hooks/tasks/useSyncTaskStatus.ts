
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SyncTaskStatusOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useSyncTaskStatus = () => {
  const queryClient = useQueryClient();

  // Function to update a general task and its linked meeting task
  const syncTaskStatus = async (
    taskId: string,
    status: string,
    options?: SyncTaskStatusOptions
  ) => {
    try {
      // First, update the general task
      const { data: generalTask, error: generalTaskError } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .select('*')
        .single();

      if (generalTaskError) throw generalTaskError;

      // Check if there's a matching meeting task linked to this general task
      const { data: meetingTasks, error: linkError } = await supabase
        .from('meeting_tasks')
        .select('*')
        .eq('general_task_id', taskId);

      if (linkError) throw linkError;

      // If there are linked meeting tasks, update them as well
      if (meetingTasks && meetingTasks.length > 0) {
        for (const meetingTask of meetingTasks) {
          console.log(`Updating linked meeting task ${meetingTask.id} status to ${status}`);
          const { error: meetingTaskError } = await supabase
            .from('meeting_tasks')
            .update({ status })
            .eq('id', meetingTask.id);

          if (meetingTaskError) {
            console.error("Error updating linked meeting task:", meetingTaskError);
          }
        }

        // Invalidate meeting tasks queries for all related meetings
        const meetingIds = meetingTasks.map(task => task.meeting_id);
        for (const meetingId of meetingIds) {
          queryClient.invalidateQueries({ queryKey: ['meeting-tasks', meetingId] });
        }
      }

      // Invalidate general tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['general-tasks'] });

      if (options?.onSuccess) {
        options.onSuccess();
      }

      return generalTask;
    } catch (error) {
      console.error("Error syncing task status:", error);
      if (options?.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  };

  return { syncTaskStatus };
};
