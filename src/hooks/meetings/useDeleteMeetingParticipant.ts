
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      // First, get the meeting_id for this participant to invalidate the query later
      const { data: participant, error: getError } = await supabase
        .from('meeting_participants')
        .select('meeting_id')
        .eq('id', participantId)
        .single();
      
      if (getError) throw getError;
      
      const meetingId = participant.meeting_id;
      
      // Now delete the participant
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);
        
      if (error) throw error;
      
      return { participantId, meetingId };
    },
    onSuccess: ({ meetingId }) => {
      toast.success("تم حذف المشارك بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
    },
    onError: (error) => {
      console.error("Error deleting participant:", error);
      toast.error("حدث خطأ أثناء حذف المشارك");
    }
  });
};
