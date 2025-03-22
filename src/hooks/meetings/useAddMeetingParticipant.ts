
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticipantRole, AttendanceStatus } from "@/types/meeting";

interface ParticipantInput {
  user_id?: string;
  user_email?: string;
  user_display_name?: string; // Changed from required to optional
  user_phone?: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
  is_external: boolean;
}

interface AddParticipantParams {
  meetingId: string;
  participant: ParticipantInput;
}

export const useAddMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, participant }: AddParticipantParams) => {
      // Ensure user_display_name has a default value if it's not provided
      const participantData = {
        ...participant,
        user_display_name: participant.user_display_name || 
                           participant.user_email?.split('@')[0] || 
                           'مشارك'
      };

      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          ...participantData
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تمت إضافة المشارك بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error adding participant:", error);
      toast.error("حدث خطأ أثناء إضافة المشارك");
    }
  });
};
