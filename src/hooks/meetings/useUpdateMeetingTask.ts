
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingTask } from "@/types/meeting";

interface UpdateMeetingTaskParams {
  id: string;
  meeting_id: string;
  updates: Partial<MeetingTask>;
}

export const useUpdateMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateMeetingTaskParams) => {
      const { data, error } = await supabase
        .from('meeting_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تم تحديث المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating meeting task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    }
  });
};
