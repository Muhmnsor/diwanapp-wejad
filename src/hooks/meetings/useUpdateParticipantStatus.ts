
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "@/types/meeting";

interface UpdateStatusParams {
  participantId: string;
  status: AttendanceStatus;
}

export const useUpdateParticipantStatus = (meetingId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, status }: UpdateStatusParams) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ 
          attendance_status: status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', participantId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating participant status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
    }
  });
};
