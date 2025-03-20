
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { toast } from "sonner";

interface UpdateMeetingParams {
  id: string;
  updates: Partial<Meeting>;
}

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateMeetingParams) => {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تم تحديث الاجتماع بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', data.id] });
    },
    onError: (error) => {
      console.error("Error updating meeting:", error);
      toast.error("حدث خطأ أثناء تحديث الاجتماع");
    }
  });
};
