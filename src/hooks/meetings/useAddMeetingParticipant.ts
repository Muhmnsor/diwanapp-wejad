
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticipantRole, AttendanceStatus } from "@/types/meeting";

interface ParticipantInput {
  user_id?: string;
  user_email?: string;
  user_display_name: string;
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
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          ...participant
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
