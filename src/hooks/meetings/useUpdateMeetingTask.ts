
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingTask } from "@/types/meeting";

interface UpdateMeetingTaskParams {
  id: string;
  meeting_id: string;
  updates: Partial<MeetingTask>;
}

export const useUpdateMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates, meeting_id }: UpdateMeetingTaskParams) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // If this task has a general_task_id, update the general task as well
      if (data.general_task_id) {
        try {
          const generalTaskUpdates: Record<string, any> = {};
          
          // Map relevant fields to the general task
          if (updates.title) generalTaskUpdates.title = updates.title;
          if (updates.description) generalTaskUpdates.description = updates.description;
          if (updates.status) generalTaskUpdates.status = updates.status;
          if (updates.due_date) generalTaskUpdates.due_date = updates.due_date;
          if (updates.assigned_to) generalTaskUpdates.assigned_to = updates.assigned_to;
          
          if (Object.keys(generalTaskUpdates).length > 0) {
            const { error: generalTaskError } = await supabase
              .from('tasks')
              .update(generalTaskUpdates)
              .eq('id', data.general_task_id);
              
            if (generalTaskError) {
              console.error("Error updating general task:", generalTaskError);
            }
          }
        } catch (e) {
          console.error("Error updating general task:", e);
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تم تحديث المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating meeting task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    }
  });
};
