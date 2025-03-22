
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingTask } from "@/types/meeting";
import { useAuthStore } from "@/store/refactored-auth";

export type CreateMeetingTaskInput = Omit<MeetingTask, 'id' | 'created_at' | 'updated_at'>;

export const useCreateMeetingTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (taskData: CreateMeetingTaskInput) => {
      if (!user?.id) {
        throw new Error('يجب تسجيل الدخول لإضافة مهمة');
      }
      
      const { data, error } = await supabase
        .from('meeting_tasks')
        .insert({
          ...taskData,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If this is a task that should be added to the general tasks system
      if (taskData.add_to_general_tasks) {
        try {
          // Add to general tasks
          const { data: generalTask, error: generalTaskError } = await supabase
            .from('tasks')
            .insert({
              title: taskData.title,
              description: taskData.description || '',
              status: 'pending',
              priority: 'medium',
              due_date: taskData.due_date,
              assigned_to: taskData.assigned_to,
              is_general: true,
              category: taskData.task_type,
              created_by: user.id,
              requires_deliverable: false,
              meeting_task_id: data.id // Reference to the original meeting task
            })
            .select()
            .single();
            
          if (generalTaskError) {
            console.error("Error creating general task:", generalTaskError);
            // We don't throw here to avoid rolling back the meeting task creation
          } else {
            console.log("Created general task:", generalTask);
            
            // Update the meeting task with the general task ID
            await supabase
              .from('meeting_tasks')
              .update({ general_task_id: generalTask.id })
              .eq('id', data.id);
          }
        } catch (e) {
          console.error("Error in general task creation:", e);
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success("تمت إضافة المهمة بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-tasks', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error creating meeting task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    }
  });
};
