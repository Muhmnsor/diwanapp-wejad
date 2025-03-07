
import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";
import { useTasksState } from "./useTasksState";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
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

  // Setup Supabase real-time subscription for task changes
  useEffect(() => {
    if (!projectId) return;
    
    console.log("Setting up real-time task updates for project:", projectId);
    
    // Create a channel to listen for task changes on this project
    const channel = supabase
      .channel(`project-tasks-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log("Task update received:", payload);
          
          // Update the local task state with the new task data
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === payload.new.id ? { ...task, ...payload.new } as Task : task
            )
          );
          
          // Show toast notification for the update
          toast.info("تم تحديث المهمة");
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log("Task deletion received:", payload);
          
          // Remove the deleted task from the local state
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== payload.old.id)
          );
          
          // Show toast notification for the deletion
          toast.info("تم حذف المهمة");
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log("New task received:", payload);
          
          // Fetch the full task data since the realtime payload might not include all fields
          fetchTasks();
          
          // Show toast notification for the new task
          toast.info("تم إضافة مهمة جديدة");
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    
    // Cleanup function to remove the channel when the component unmounts
    return () => {
      console.log("Removing real-time task updates subscription");
      supabase.removeChannel(channel);
    };
  }, [projectId, setTasks, fetchTasks]);

  // Update task function
  const updateTask = async (taskId: string, updateData: Partial<Task>) => {
    try {
      console.log("Updating task:", taskId, updateData);
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Local state will be updated by the real-time subscription
      // We still update it here for immediate UI feedback
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
      
      // Local state will be updated by the real-time subscription
      // We still update it here for immediate UI feedback
      setTasks((prevTasks: Task[]) => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
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
