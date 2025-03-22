
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteMeetingTaskParams {
  id: string;
  meeting_id: string;
  general_task_id?: string;
  deleteGeneralTask?: boolean;
}

export const useDeleteMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, meeting_id, general_task_id, deleteGeneralTask }: DeleteMeetingTaskParams) => {
      // If there's a linked general task and the user wants to delete it too
      if (general_task_id && deleteGeneralTask) {
        const { error: generalTaskError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', general_task_id);
          
        if (generalTaskError) {
          console.error("Error deleting general task:", generalTaskError);
          // Continue to delete meeting task even if general task deletion fails
        }
      }
      
      // Delete the meeting task
      const { error } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { id, meeting_id };
    },
    onSuccess: (data) => {
      toast.success("تم حذف المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error deleting meeting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  });
};
