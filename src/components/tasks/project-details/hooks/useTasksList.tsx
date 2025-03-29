
import { useState } from "react";
import { useTasksFetching } from "./useTasksFetching";
import { useProjectStages } from "./useProjectStages";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TasksListOptions {
  projectId?: string;
  meetingId?: string;
  isWorkspace?: boolean;
}

export const useTasksList = (options: TasksListOptions) => {
  const { projectId, meetingId, isWorkspace = false } = options;
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Pass the options object to useTasksFetching
  const { 
    tasks, 
    isLoading, 
    tasksByStage, 
    setTasks, 
    setTasksByStage, 
    fetchTasks 
  } = useTasksFetching({
    projectId,
    meetingId,
    isWorkspace
  });

  // Fetch project stages if we have a project ID
  const { projectStages, handleStagesChange } = useProjectStages({ 
    projectId: projectId && !isWorkspace ? projectId : undefined
  });

  // Determine if this is for general tasks
  const isGeneral = !projectId && !meetingId;

  // Handler for updating task status
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        return task;
      });

      setTasks(updatedTasks);

      // Update tasksByStage if needed
      if (Object.keys(tasksByStage).length > 0) {
        const updatedTasksByStage = { ...tasksByStage };
        
        // Iterate through each stage
        Object.keys(updatedTasksByStage).forEach(stageId => {
          // Update the task in the stage if it exists
          updatedTasksByStage[stageId] = updatedTasksByStage[stageId].map(task => {
            if (task.id === taskId) {
              return { ...task, status: newStatus };
            }
            return task;
          });
        });
        
        setTasksByStage(updatedTasksByStage);
      }

      toast.success("تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  // Function to delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // Update tasksByStage if needed
      if (Object.keys(tasksByStage).length > 0) {
        const updatedTasksByStage = { ...tasksByStage };
        
        // Filter out the deleted task from each stage
        Object.keys(updatedTasksByStage).forEach(stageId => {
          updatedTasksByStage[stageId] = updatedTasksByStage[stageId].filter(
            task => task.id !== taskId
          );
        });
        
        setTasksByStage(updatedTasksByStage);
      }

      toast.success("تم حذف المهمة بنجاح");
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
    isGeneral,
    deleteTask
  };
};
