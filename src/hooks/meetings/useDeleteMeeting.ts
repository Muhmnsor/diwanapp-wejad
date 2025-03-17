
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
      
      if (error) {
        console.error('Error deleting meeting:', error);
        throw error;
      }
      
      return meetingId;
    },
    onSuccess: (meetingId) => {
      toast.success('تم حذف الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', meetingId] });
    },
    onError: (error) => {
      console.error('Error in meeting deletion:', error);
      toast.error('حدث خطأ أثناء حذف الاجتماع');
    }
  });
};
