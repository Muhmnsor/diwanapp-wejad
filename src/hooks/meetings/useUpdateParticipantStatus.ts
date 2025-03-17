
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdateParticipantStatusParams {
  participantId: string;
  attendanceStatus: "pending" | "confirmed" | "attended" | "absent";
  meetingId: string;
}

export const useUpdateParticipantStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, attendanceStatus, meetingId }: UpdateParticipantStatusParams) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ 
          attendance_status: attendanceStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating participant status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('تم تحديث حالة المشارك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', variables.meetingId] });
    },
    onError: (error) => {
      console.error('Error in updating participant status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المشارك');
    }
  });
};
