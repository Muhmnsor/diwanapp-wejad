
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticipantRole, AttendanceStatus } from "@/types/meeting";
import { v4 as uuidv4 } from "uuid";

interface ParticipantInput {
  user_id?: string;
  user_email: string;
  user_display_name: string;
  role: ParticipantRole;
  attendance_status: AttendanceStatus;
  title?: string; // إضافة: منصب المشارك التنظيمي
  phone?: string; // إضافة: رقم هاتف المشارك
}

interface AddParticipantParams {
  meetingId: string;
  participant: ParticipantInput;
}

export const useAddMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, participant }: AddParticipantParams) => {
      // توليد معرف UUID للمستخدم إذا لم يتم توفيره
      const user_id = participant.user_id || uuidv4();
      
      console.log('Adding participant with data:', { meetingId, ...participant });
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id,
          ...participant
        })
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
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
