
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
      
      console.log("Creating meeting task with data:", taskData);
      
      // Create the meeting task
      const { data, error } = await supabase
        .from('meeting_tasks')
        .insert({
          ...taskData,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error in meeting task creation:", error);
        throw error;
      }
      
      console.log("Successfully created meeting task:", data);
      
      // If this is a task that should be added to the general tasks system
      if (taskData.add_to_general_tasks) {
        try {
          console.log("Adding task to general tasks system");
          
          // The assigned_to field in tasks table expects a UUID
          // If assigned_to is not provided or not a valid UUID, use the current user's ID
          let assignedToUuid = user.id;
          
          if (taskData.assigned_to) {
            // Check if assigned_to is already a UUID
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidPattern.test(taskData.assigned_to)) {
              assignedToUuid = taskData.assigned_to;
            } else {
              console.log("assigned_to is not a UUID, using current user ID instead");
            }
          }
          
          // Add to general tasks
          const { data: generalTask, error: generalTaskError } = await supabase
            .from('tasks')
            .insert({
              title: taskData.title,
              description: taskData.description || '',
              status: 'pending',
              priority: 'medium',
              due_date: taskData.due_date,
              assigned_to: assignedToUuid, // Use the UUID
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
