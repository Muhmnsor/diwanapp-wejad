
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";
import { useProjectStatusUpdater } from "./useProjectStatusUpdater";

export const useTaskStatusManagement = (
  projectId: string | undefined,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  tasksByStage: Record<string, Task[]>,
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>
) => {
  const { updateProjectStatus } = useProjectStatusUpdater();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!projectId) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error("Error updating task status:", error);
        toast.error("حدث خطأ أثناء تحديث حالة المهمة");
        return;
      }

      // Update local state to reflect the change
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus } 
          : task
      );
      
      setTasks(updatedTasks);

      // Update tasksByStage state
      setTasksByStage(prevTasksByStage => {
        const newTasksByStage = { ...prevTasksByStage };
        
        // Update the task status in each stage
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus } 
              : task
          );
        });
        
        return newTasksByStage;
      });
      
      // After updating task status, update project status
      await updateProjectStatus(projectId, updatedTasks);

      toast.success(newStatus === 'completed' 
        ? "تم إكمال المهمة بنجاح" 
        : "تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  return {
    handleStatusChange
  };
};
