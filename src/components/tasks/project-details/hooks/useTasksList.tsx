import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";
import { useTasksState } from "./useTasksState";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Task } from "../types/task";

export const useTasksList = (
  projectId?: string, 
  meetingId?: string, 
  isWorkspace: boolean = false
) => {
  // Hook for handling UI state
  const {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange
  } = useTasksState();

  // Hook for fetching tasks with separate parameters
  const {
    tasks,
    isLoading,
    tasksByStage,
    setTasks,
    setTasksByStage,
    fetchTasks
  } = useTasksFetching(projectId, meetingId, isWorkspace);

  // Hook for task status management
  const { handleStatusChange } = useTaskStatusManagement(
    projectId,
    tasks,
    setTasks,
    tasksByStage,
    setTasksByStage
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
      
      // Update the tasks list with the updated task
      setTasks(prevTasks => 
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

  // Delete task function
  const deleteTask = async (taskId: string) => {
    try {
      console.log("Deleting task:", taskId);
      
      // 1. حذف المهام الفرعية المرتبطة بالمهمة - التحقق من وجود البيانات في كلا الجدولين
      // Check both subtasks tables
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);
      
      if (subtasksError) {
        console.error("Error deleting subtasks:", subtasksError);
        // نستمر في الحذف حتى لو فشل حذف المهام الفرعية
      }
      
      // Also try task_subtasks table
      const { error: taskSubtasksError } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('parent_task_id', taskId);
      
      if (taskSubtasksError) {
        console.error("Error deleting task_subtasks:", taskSubtasksError);
        // نستمر في الحذف حتى لو فشل حذف المهام الفرعية
      }
      
      // 2. حذف المرفقات
      const { error: attachmentsError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('task_id', taskId);
        
      if (attachmentsError) {
        console.error("Error deleting task attachments:", attachmentsError);
        // نستمر في الحذف حتى لو فشل حذف المرفقات
      }
      
      const { error: portfolioAttachmentsError } = await supabase
        .from('portfolio_task_attachments')
        .delete()
        .eq('task_id', taskId);
        
      if (portfolioAttachmentsError) {
        console.error("Error deleting portfolio attachments:", portfolioAttachmentsError);
        // نستمر في الحذف حتى لو فشل حذف مرفقات المحفظة
      }
      
      // 3. حذف نماذج المهمة
      const { error: templatesError } = await supabase
        .from('task_templates')
        .delete()
        .eq('task_id', taskId);
        
      if (templatesError) {
        console.error("Error deleting templates:", templatesError);
        // نستمر في الحذف حتى لو فشل حذف النماذج
      }
      
      // 4. حذف تعليقات المهمة
      const { error: commentsError } = await supabase
        .from('task_comments')
        .delete()
        .eq('task_id', taskId);
        
      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        // نستمر في الحذف حتى لو فشل حذف التعليقات
      }
      
      // Also try unified_task_comments table
      const { error: unifiedCommentsError } = await supabase
        .from('unified_task_comments')
        .delete()
        .eq('task_id', taskId)
        .eq('task_table', 'tasks');
        
      if (unifiedCommentsError) {
        console.error("Error deleting unified comments:", unifiedCommentsError);
        // نستمر في الحذف حتى لو فشل حذف التعليقات الموحدة
      }
      
      // 5. حذف المرفقات من جدول task_discussion_attachments
      const { error: discussionAttachmentsError } = await supabase
        .from('task_discussion_attachments')
        .delete()
        .eq('task_id', taskId)
        .eq('task_table', 'tasks');
        
      if (discussionAttachmentsError) {
        console.error("Error deleting discussion attachments:", discussionAttachmentsError);
        // نستمر في الحذف حتى لو فشل حذف مرفقات المناقشة
      }
      
      // 6. حذف المهمة نفسها
      let { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // بدلاً من تحديث الحالة المحلية فقط، نقوم بإعادة تحميل البيانات
      // لضمان تحديث كل من tasks و tasksByStage
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
    isGeneral: !projectId && !meetingId && !isWorkspace,
    deleteTask,
    updateTask
  };
};
