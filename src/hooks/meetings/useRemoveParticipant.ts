
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RemoveParticipantParams {
  meetingId: string;
  participantId: string;
}

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, participantId }: RemoveParticipantParams) => {
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId)
        .eq('meeting_id', meetingId);
      
      if (error) {
        console.error('Error removing participant:', error);
        throw error;
      }
      
      return { meetingId, participantId };
    },
    onSuccess: (result) => {
      toast.success('تم إزالة المشارك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', result.meetingId] });
    },
    onError: (error) => {
      console.error('Error in participant removal:', error);
      toast.error('حدث خطأ أثناء إزالة المشارك');
    }
  });
};
