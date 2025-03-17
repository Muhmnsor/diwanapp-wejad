
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingParticipant, ParticipantRole, AttendanceStatus } from "@/types/meeting";
import { toast } from "sonner";

interface NewParticipant {
  user_email: string;
  user_display_name: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
}

interface AddParticipantParams {
  meetingId: string;
  participant: NewParticipant;
}

export const useAddMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, participant }: AddParticipantParams) => {
      // Get current user id
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert([{
          meeting_id: meetingId,
          user_id: null, // When adding by email, user_id might be null initially
          role: participant.role,
          attendance_status: participant.attendance_status,
          user_display_name: participant.user_display_name,
          user_email: participant.user_email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding meeting participant:', error);
        throw error;
      }
      
      return data as MeetingParticipant;
    },
    onSuccess: (_, variables) => {
      toast.success('تمت إضافة المشارك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.meetingId] });
    },
    onError: (error) => {
      console.error('Error in adding participant:', error);
      toast.error('حدث خطأ أثناء إضافة المشارك');
    }
  });
};
