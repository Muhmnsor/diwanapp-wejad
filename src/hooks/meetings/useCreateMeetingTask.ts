
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingTask, TaskType } from "@/types/meeting";

interface CreateMeetingTaskParams {
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: TaskType;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  add_to_general_tasks?: boolean;
}

export const useCreateMeetingTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateMeetingTaskParams) => {
      console.log('Creating meeting task:', taskData);
      
      if (!taskData.meeting_id || !taskData.title) {
        throw new Error("Meeting ID and task title are required");
      }
      
      // Create the meeting task
      const { data, error } = await supabase
        .from('meeting_tasks')
        .insert({
          meeting_id: taskData.meeting_id,
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          assigned_to: taskData.assigned_to,
          task_type: taskData.task_type,
          status: taskData.status,
          created_at: new Date().toISOString(),
          add_to_general_tasks: taskData.add_to_general_tasks || false
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating meeting task:', error);
        throw error;
      }
      
      // If add_to_general_tasks is true, also create a general task
      if (taskData.add_to_general_tasks) {
        // Logic to add to general tasks system would go here
        console.log('Would add to general tasks:', taskData);
      }
      
      return data as MeetingTask;
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
