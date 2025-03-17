
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { toast } from "sonner";

export interface UpdateMeetingData {
  id: string;
  updates: Partial<Omit<Meeting, 'id' | 'created_by' | 'created_at' | 'updated_at'>>;
}

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateMeetingData) => {
      const { data, error } = await supabase
        .from('meetings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating meeting:', error);
        throw error;
      }
      
      return data as Meeting;
    },
    onSuccess: (_, variables) => {
      toast.success('تم تحديث الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', variables.id] });
    },
    onError: (error) => {
      console.error('Error in meeting update:', error);
      toast.error('حدث خطأ أثناء تحديث الاجتماع');
    }
  });
};
