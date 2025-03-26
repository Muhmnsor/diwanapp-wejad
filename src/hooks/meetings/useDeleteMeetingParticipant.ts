
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      console.log('Deleting participant with ID:', participantId);
      
      // First get the meeting_id before deletion for cache invalidation
      const { data: participant, error: fetchError } = await supabase
        .from('meeting_participants')
        .select('meeting_id')
        .eq('id', participantId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching participant:', fetchError);
        throw fetchError;
      }
      
      const meetingId = participant.meeting_id;
      console.log('Meeting ID for invalidation:', meetingId);
      
      // Now perform the deletion
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);
        
      if (error) {
        console.error('Error during deletion:', error);
        throw error;
      }
      
      return { participantId, meetingId };
    },
    onSuccess: (data) => {
      toast.success("تم حذف المشارك بنجاح");
      
      // Invalidate the relevant queries using the meeting ID we saved
      if (data?.meetingId) {
        queryClient.invalidateQueries({
          queryKey: ['meeting-participants', data.meetingId]
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting participant:", error);
      toast.error("حدث خطأ أثناء حذف المشارك");
    }
  });
};
