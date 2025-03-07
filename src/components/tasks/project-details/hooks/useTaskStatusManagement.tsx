
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";
import { toast } from "sonner";

export const useTaskStatusManagement = (
  projectId: string | undefined,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  tasksByStage: Record<string, Task[]>,
  setTasksByStage: (callback: (prev: Record<string, Task[]>) => Record<string, Task[]>) => void
) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!taskId) return;
    
    setIsUpdating(true);
    try {
      // Update task status in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      
      // Update tasks by stage
      setTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        
        // Remove the task from all stage groups first
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].filter(task => task.id !== taskId);
        });
        
        // Find the updated task
        const updatedTask = updatedTasks.find(task => task.id === taskId);
        
        // Add the task to the appropriate stage group if it exists
        if (updatedTask && updatedTask.stage_id) {
          if (!newTasksByStage[updatedTask.stage_id]) {
            newTasksByStage[updatedTask.stage_id] = [];
          }
          newTasksByStage[updatedTask.stage_id].push(updatedTask);
        }
        
        return newTasksByStage;
      });
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStatusChange,
    isUpdating
  };
};
