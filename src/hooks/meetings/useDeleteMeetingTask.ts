
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, meetingId }: { id: string; meetingId: string }) => {
      const { error } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { id, meetingId };
    },
    onSuccess: ({ meetingId }) => {
      toast.success("تم حذف المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', meetingId] });
    },
    onError: (error) => {
      console.error("Error deleting meeting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  });
};
