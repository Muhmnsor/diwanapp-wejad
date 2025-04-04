
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksList = (
  projectId?: string, 
  meetingId?: string, 
  isWorkspace: boolean = false
) => {
  // Hook for handling UI state
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);

  const handleStagesChange = (stages: { id: string; name: string }[]) => {
    setProjectStages(stages);
  };

  // Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  // Fetch tasks with proper user profile information
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching tasks with params:", { projectId, meetingId, isWorkspace });
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to (display_name, email),
          stage:stage_id (name)
        `);

      // Filter based on what's provided - using clear logic for each task type
      if (isWorkspace && projectId) {
        // Case 1: Workspace tasks - specific to a workspace
        console.log("Fetching workspace tasks for workspace ID:", projectId);
        query = query.eq('workspace_id', projectId);
      } else if (meetingId) {
        // Case 2: Meeting tasks - tied to a specific meeting
        console.log("Fetching meeting tasks for meeting ID:", meetingId);
        query = query.eq('meeting_id', meetingId);
      } else if (projectId) {
        // Case 3: Project tasks - specific to a project
        console.log("Fetching project tasks for project ID:", projectId);
        query = query.eq('project_id', projectId);
      } else {
        // Case 4: General tasks - not tied to any specific entity
        console.log("Fetching general tasks");
        query = query.eq('is_general', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Fetched tasks raw data:", data);

      // Transform data to add user info and stage name
      const transformedTasks = data.map(task => {
        // Add proper debugging for assigned user
        console.log("Task assigned_to:", task.assigned_to);
        console.log("Task profiles:", task.profiles);

        // Safely extract the assigned user name
        let assignedUserName = '';
        if (task.profiles) {
          assignedUserName = task.profiles.display_name || task.profiles.email || '';
          console.log("Extracted assigned user name:", assignedUserName);
        }

        // Safely extract stage name
        let stageName = '';
        if (task.stage) {
          stageName = task.stage.name || '';
        }

        return {
          ...task,
          assigned_user_name: assignedUserName,
          stage_name: stageName,
        };
      });

      console.log("Transformed tasks with user names:", transformedTasks);

      setTasks(transformedTasks);

      // Group tasks by stage for project tasks with stages
      if (projectId && !isWorkspace && !meetingId) {
        const groupedTasks: Record<string, Task[]> = {};
        transformedTasks.forEach(task => {
          if (task.stage_id) {
            if (!groupedTasks[task.stage_id]) {
              groupedTasks[task.stage_id] = [];
            }
            groupedTasks[task.stage_id].push(task);
          }
        });
        setTasksByStage(groupedTasks);
      }

      return transformedTasks;
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Hook for task status management
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      console.log("Updating task status:", taskId, "to", newStatus);
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Update tasksByStage
      setTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        
        // Update the task in all stage groups
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          );
        });
        
        return newTasksByStage;
      });
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

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

  useEffect(() => {
    fetchTasks();
  }, [projectId, meetingId, isWorkspace]);

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
