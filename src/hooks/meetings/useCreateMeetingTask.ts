
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask } from "@/types/meeting";
import { toast } from "sonner";

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
