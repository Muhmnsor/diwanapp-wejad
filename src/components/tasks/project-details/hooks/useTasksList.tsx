
import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";
import { useTasksState } from "./useTasksState";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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

  // Delete task function
  const deleteTask = async (taskId: string) => {
    try {
      // قبل حذف المهمة، نحذف المهام الفرعية والمرفقات والنماذج والتعليقات المرتبطة بها
      
      // 1. حذف المهام الفرعية
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('parent_task_id', taskId);
      
      if (subtasksError) throw subtasksError;
      
      // 2. حذف المرفقات
      const { error: attachmentsError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('task_id', taskId);
        
      if (attachmentsError) throw attachmentsError;
      
      const { error: portfolioAttachmentsError } = await supabase
        .from('portfolio_task_attachments')
        .delete()
        .eq('task_id', taskId);
        
      if (portfolioAttachmentsError) throw portfolioAttachmentsError;
      
      // 3. حذف نماذج المهمة
      const { error: templatesError } = await supabase
        .from('task_templates')
        .delete()
        .eq('task_id', taskId);
        
      if (templatesError) throw templatesError;
      
      // 4. حذف تعليقات المهمة
      const { error: commentsError } = await supabase
        .from('task_comments')
        .delete()
        .eq('task_id', taskId);
        
      if (commentsError) throw commentsError;
      
      // 5. حذف المهمة نفسها
      let { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // تحديث واجهة المستخدم بعد الحذف
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
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
    deleteTask
  };
};
