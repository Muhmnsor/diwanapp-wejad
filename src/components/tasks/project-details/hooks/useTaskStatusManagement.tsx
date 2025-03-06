
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
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
    
    // Store original task and its status for rollback if needed
    const originalTask = tasks.find(task => task.id === taskId);
    const originalStatus = originalTask?.status;
    
    if (!originalTask) {
      console.error("Task not found:", taskId);
      setIsUpdating(false);
      return;
    }
    
    try {
      // Optimistically update the UI first
      // 1. Update tasks list
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      
      // 2. Update tasks by stage
      setTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        
        // Remove the task from all stage groups first
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].filter(task => task.id !== taskId);
        });
        
        // Add the task to the appropriate stage group if it exists
        if (originalTask.stage_id) {
          if (!newTasksByStage[originalTask.stage_id]) {
            newTasksByStage[originalTask.stage_id] = [];
          }
          
          // Add the updated task to its stage
          newTasksByStage[originalTask.stage_id].push({ 
            ...originalTask, 
            status: newStatus 
          });
        }
        
        return newTasksByStage;
      });
      
      // Now perform the actual database update
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) {
        throw error;
      }
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
      
      // Rollback the UI changes on error
      const rollbackTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: originalStatus } : task
      );
      
      setTasks(rollbackTasks);
      
      // Rollback the tasks by stage
      setTasksByStage(prev => {
        const rollbackTasksByStage = { ...prev };
        
        // Remove the task from all stage groups first
        Object.keys(rollbackTasksByStage).forEach(stageId => {
          rollbackTasksByStage[stageId] = rollbackTasksByStage[stageId].filter(task => task.id !== taskId);
        });
        
        // Add the task back to the appropriate stage group with original status
        if (originalTask.stage_id) {
          if (!rollbackTasksByStage[originalTask.stage_id]) {
            rollbackTasksByStage[originalTask.stage_id] = [];
          }
          
          rollbackTasksByStage[originalTask.stage_id].push(originalTask);
        }
        
        return rollbackTasksByStage;
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleStatusChange,
    isUpdating
  };
};
