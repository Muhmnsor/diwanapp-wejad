
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
  is_system_user?: boolean; // إضافة: هل المشارك مستخدم في النظام
}

interface AddParticipantParams {
  meetingId: string;
  participant: ParticipantInput;
}

export const useAddMeetingParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, participant }: AddParticipantParams) => {
      // إذا كان المشارك مستخدم نظام، استخدم معرفه المقدم
      // وإلا قم بتوليد معرف UUID جديد للمشارك الخارجي
      const user_id = participant.is_system_user 
        ? participant.user_id 
        : (participant.user_id || uuidv4());
      
      console.log('Adding participant with data:', { meetingId, ...participant, user_id });
      
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingId,
          user_id,
          user_email: participant.user_email,
          user_display_name: participant.user_display_name,
          role: participant.role,
          attendance_status: participant.attendance_status,
          title: participant.title,
          phone: participant.phone
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
