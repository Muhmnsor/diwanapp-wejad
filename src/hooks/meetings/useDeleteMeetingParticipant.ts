
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);
        
      if (error) throw error;
      
      return participantId;
    },
    onSuccess: (_, participantId) => {
      toast.success("تم حذف المشارك بنجاح");
      
      // We use a more general approach to invalidate all meeting-participants queries
      // This ensures all queries that fetch meeting participants are refreshed
      queryClient.invalidateQueries({
        queryKey: ['meeting-participants']
      });
    },
    onError: (error) => {
      console.error("Error deleting participant:", error);
      toast.error("حدث خطأ أثناء حذف المشارك");
    }
  });
};
