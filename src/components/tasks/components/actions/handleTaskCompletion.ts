
import { supabase } from "@/integrations/supabase/client";
import { updateUserStats } from "../../reports/utils/achievementsCalculator";

interface TaskCompletionProps {
  taskId: string;
  taskTable: 'tasks' | 'portfolio_tasks' | 'project_tasks' | 'subtasks';
  userId: string;
  dueDate?: string;
}

export const handleTaskCompletion = async ({
  taskId,
  taskTable,
  userId,
  dueDate
}: TaskCompletionProps) => {
  try {
    if (!taskId || !taskTable || !userId) {
      console.error("Missing required parameters for task completion");
      return;
    }
    
    const now = new Date();
    let completionTimeHours = null;
    let delayHours = null;
    
    // Get task creation date
    const { data: taskData, error: taskError } = await supabase
      .from(taskTable)
      .select('created_at')
      .eq('id', taskId)
      .single();
      
    if (taskError) {
      console.error(`Error fetching task creation date: ${taskError.message}`);
    } else if (taskData) {
      const createdAt = new Date(taskData.created_at);
      completionTimeHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      // Calculate delay if due date exists
      if (dueDate) {
        const dueDateTime = new Date(dueDate);
        delayHours = (now.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60);
      }
    }
    
    // Record task completion in history
    await supabase
      .from('task_history')
      .insert({
        task_id: taskId,
        action: 'status_changed',
        field_name: 'status',
        old_value: 'pending',
        new_value: 'completed',
        changed_by: userId,
        completion_time_hours: completionTimeHours,
        delay_hours: delayHours
      });
    
    // Update user stats and achievements
    await updateUserStats(userId);
    
    return { success: true };
  } catch (error) {
    console.error("Error handling task completion:", error);
    return { success: false, error };
  }
};
