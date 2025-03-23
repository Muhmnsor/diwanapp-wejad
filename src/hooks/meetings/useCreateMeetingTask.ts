
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types/meeting";

type CreateMeetingTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

export const useCreateMeetingTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: CreateMeetingTaskInput) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          category: 'meeting',
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تمت إضافة المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['tasks', 'meeting', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error creating meeting task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    }
  });
};
