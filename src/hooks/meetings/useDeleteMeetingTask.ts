
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteMeetingTaskParams {
  id: string;
  meeting_id: string;
}

export const useDeleteMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, meeting_id }: DeleteMeetingTaskParams) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { id, meeting_id };
    },
    onSuccess: ({ meeting_id }) => {
      toast.success("تم حذف المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['tasks', 'meeting', meeting_id] });
    },
    onError: (error) => {
      console.error("Error deleting meeting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  });
};
