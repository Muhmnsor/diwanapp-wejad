
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingMinutes } from "./useMeetingMinutes";

export const useUpdateMeetingMinutes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, content }: { meetingId: string; content: string }) => {
      // First check if minutes already exist for this meeting
      const { data: existingMinutes } = await supabase
        .from('meeting_minutes')
        .select('id')
        .eq('meeting_id', meetingId)
        .single();
      
      let result;
      
      if (existingMinutes) {
        // Update existing minutes
        const { data, error } = await supabase
          .from('meeting_minutes')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', existingMinutes.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new minutes
        const { data, error } = await supabase
          .from('meeting_minutes')
          .insert({ meeting_id: meetingId, content })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      return result as MeetingMinutes;
    },
    onSuccess: (data) => {
      toast.success("تم حفظ محضر الاجتماع بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-minutes', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating meeting minutes:", error);
      toast.error("حدث خطأ أثناء حفظ محضر الاجتماع");
    }
  });
};
