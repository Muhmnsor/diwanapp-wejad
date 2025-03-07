
import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";
import { useTasksState } from "./useTasksState";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Task } from "@/types/workspace";

export const useTasksList = (projectId: string | undefined) => {
  // Hook for handling UI state
  const {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange
  } = useTasksState();

  // Hook for fetching tasks
  const {
    tasks,
    isLoading,
    tasksByStage,
    setTasks: originalSetTasks, 
    fetchTasks
  } = useTasksFetching(projectId);

  // Create a wrapper function for setTasks that handles the function-based updates correctly
  const setTasks = (tasksOrUpdater: Task[] | ((prevTasks: Task[]) => Task[])) => {
    if (typeof tasksOrUpdater === 'function') {
      // If it's a function updater, we need to get the current tasks and apply the function
      const updatedTasks = tasksOrUpdater(tasks);
      originalSetTasks(updatedTasks);
    } else {
      // If it's a direct tasks array, just pass it through
      originalSetTasks(tasksOrUpdater);
    }
  };

  // Hook for task status management
  const { handleStatusChange } = useTaskStatusManagement(
    projectId,
    tasks,
    setTasks,
    tasksByStage,
    setTasksByStage => {
      // We're adapting the callback-based setter to a direct setter
      const updaterFn = setTasksByStage;
      return updaterFn;
    }
  );

  // Update task function
  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      console.log("Updating task:", taskId, updateData);
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Use the wrapper function to correctly update tasks
      setTasks((prevTasks: Task[]) => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updateData } : task
        )
      );
      
      toast.success("تم تحديث المهمة بنجاح");
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
      throw error;
    }
  };

  // Delete task function - simplified to use the database function
  const deleteTask = async (taskId: string) => {
    try {
      console.log("Deleting task:", taskId);
      
      // Use the database function to delete the task and all related data
      const { data, error } = await supabase.rpc('delete_task', {
        p_task_id: taskId,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (error) {
        console.error("Error calling delete_task function:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to delete task");
      }
      
      // Reload tasks data to ensure UI is up to date
      await fetchTasks();
      
      toast.success("تم حذف المهمة بنجاح");
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      throw error;
    }
  };

  return {
    tasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral: !projectId,
    deleteTask,
    updateTask
  };
};
