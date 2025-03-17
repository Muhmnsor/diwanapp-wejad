
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRemoveParticipant = (meetingId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('id', participantId);
      
      if (error) {
        console.error('Error removing participant:', error);
        throw error;
      }
      
      return participantId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
    }
  });
};
