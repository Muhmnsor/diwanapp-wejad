
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) throw error;
      
      return meetingId;
    },
    onSuccess: (_, variables) => {
      toast.success("تم حذف الاجتماع بنجاح");
      // Invalidate meetings queries
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      // Also invalidate the count in folders
      queryClient.invalidateQueries({ queryKey: ['meetingFolders'] });
    },
    onError: (error) => {
      console.error("Error deleting meeting:", error);
      toast.error("حدث خطأ أثناء حذف الاجتماع");
    }
  });
};
