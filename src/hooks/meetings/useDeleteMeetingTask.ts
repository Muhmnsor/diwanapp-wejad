
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
    mutationFn: async ({ id, meeting_id, general_task_id, deleteGeneralTask = false }: DeleteMeetingTaskParams) => {
      console.log("Deleting meeting task:", id, "with general task:", general_task_id, "deleteGeneralTask:", deleteGeneralTask);
      
      // If there's a linked general task and the user wants to delete it too
      if (general_task_id && deleteGeneralTask) {
        console.log("Also deleting linked general task:", general_task_id);
        
        // First, check if this general task has other linked meeting tasks
        const { data: otherMeetingTasks, error: checkError } = await supabase
          .from('meeting_tasks')
          .select('id')
          .eq('general_task_id', general_task_id)
          .neq('id', id); // Exclude the current meeting task
          
        if (checkError) {
          console.error("Error checking for other linked meeting tasks:", checkError);
        }
        
        // If this is the only meeting task linked to this general task, or we're explicitly deleting the general task
        if (!checkError && (!otherMeetingTasks || otherMeetingTasks.length === 0)) {
          // Delete the general task
          const { error: generalTaskError } = await supabase
            .from('tasks')
            .delete()
            .eq('id', general_task_id);
            
          if (generalTaskError) {
            console.error("Error deleting general task:", generalTaskError);
            // Continue to delete meeting task even if general task deletion fails
          } else {
            console.log("Successfully deleted linked general task:", general_task_id);
            
            // Invalidate general tasks queries
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['general-tasks'] });
          }
        } else {
          console.log("Not deleting general task as it still has other linked meeting tasks");
        }
      }
      
      // Delete the meeting task
      const { error } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      console.log("Successfully deleted meeting task:", id);
      
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
