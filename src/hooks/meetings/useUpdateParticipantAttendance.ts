
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttendanceStatus } from "@/types/meeting";

interface UpdateAttendanceParams {
  participantId: string;
  attendanceStatus: AttendanceStatus;
}

export const useUpdateParticipantAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, attendanceStatus }: UpdateAttendanceParams) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ attendance_status: attendanceStatus })
        .eq('id', participantId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      const statusText = 
        data.attendance_status === 'attended' ? 'حضر' :
        data.attendance_status === 'absent' ? 'غائب' : 
        data.attendance_status === 'confirmed' ? 'مؤكد' : 'معلق';
        
      toast.success(`تم تحديث حالة المشارك إلى "${statusText}"`);
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating participant attendance:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المشارك");
    }
  });
};
