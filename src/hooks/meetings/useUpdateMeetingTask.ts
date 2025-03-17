
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask, TaskStatus } from "@/types/meeting";
import { toast } from "sonner";

export interface UpdateTaskData {
  id: string;
  meeting_id: string;
  updates: Partial<Omit<MeetingTask, 'id' | 'meeting_id' | 'created_at' | 'updated_at'>>;
}

export const useUpdateMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateTaskData) => {
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
