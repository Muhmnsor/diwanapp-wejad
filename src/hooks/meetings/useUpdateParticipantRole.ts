
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ParticipantRole } from "@/types/meeting";

interface UpdateRoleParams {
  participantId: string;
  role: string;
}

export const useUpdateParticipantRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ participantId, role }: UpdateRoleParams) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ role })
        .eq('id', participantId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      const roleLabels: Record<string, string> = {
        'chairman': 'رئيس الاجتماع',
        'secretary': 'أمين السر',
        'member': 'عضو',
        'observer': 'مراقب'
      };
      
      const roleLabel = roleLabels[data.role] || data.role;
      
      toast.success(`تم تحديث دور المشارك إلى "${roleLabel}"`);
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating participant role:", error);
      toast.error("حدث خطأ أثناء تحديث دور المشارك");
    }
  });
};
