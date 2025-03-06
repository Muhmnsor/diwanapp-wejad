
import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";
import { useTasksState } from "./useTasksState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    setTasks,
    fetchTasks
  } = useTasksFetching(projectId);

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
  
  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      // Update UI optimistically
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Update tasksByStage
      const newTasksByStage = { ...tasksByStage };
      Object.keys(newTasksByStage).forEach(stageId => {
        newTasksByStage[stageId] = newTasksByStage[stageId].filter(
          task => task.id !== taskId
        );
      });
      
      toast.success("تم حذف المهمة بنجاح");
      
    } catch (error) {
      console.error("Error handling task deletion:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      // Revert changes in case of error
      fetchTasks();
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
    handleDeleteTask,
    fetchTasks,
    isGeneral: !projectId
  };
};
