
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingTask, TaskType, TaskStatus } from "@/types/meeting";

interface CreateMeetingTaskParams {
  meeting_id: string;
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: TaskType;
  status: TaskStatus;
  add_to_general_tasks?: boolean;
  requires_deliverable?: boolean;
  priority: "high" | "medium" | "low";
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
          add_to_general_tasks: taskData.add_to_general_tasks || false,
          requires_deliverable: taskData.requires_deliverable || false,
          priority: taskData.priority || "medium"
        })
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating meeting task:', error);
        throw error;
      }
      
      // If add_to_general_tasks is true, also create a general task
      if (taskData.add_to_general_tasks) {
        try {
          const { error: generalTaskError } = await supabase
            .from('tasks')
            .insert({
              title: taskData.title,
              description: taskData.description,
              due_date: taskData.due_date,
              assigned_to: taskData.assigned_to,
              status: taskData.status,
              priority: taskData.priority,
              is_general: true,
              requires_deliverable: taskData.requires_deliverable,
              category: taskData.task_type === 'action_item' ? 'إجراء' : 
                      taskData.task_type === 'follow_up' ? 'متابعة' : 
                      taskData.task_type === 'decision' ? 'قرار' : 
                      taskData.task_type === 'preparation' ? 'تحضيرية' : 
                      taskData.task_type === 'execution' ? 'تنفيذية' : 'أخرى'
            });
            
          if (generalTaskError) {
            console.error('Error creating general task:', generalTaskError);
            // Don't block the main task creation if general task fails
          }
        } catch (generalTaskCreateError) {
          console.error('Exception creating general task:', generalTaskCreateError);
        }
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
