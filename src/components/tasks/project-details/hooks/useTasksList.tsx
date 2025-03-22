
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";

// تحديث التوقيع لاستخدام كائن الخيارات بدلاً من الوسيطات المتعددة
interface UseTasksListOptions {
  projectId?: string;
  isWorkspace?: boolean;
  externalTasks?: Task[];
  externalLoading?: boolean;
  externalError?: Error | null;
}

export const useTasksList = ({
  projectId,
  isWorkspace = false,
  externalTasks,
  externalLoading,
  externalError
}: UseTasksListOptions = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<Error | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<{ [key: string]: Task[] }>({});

  const isGeneral = !projectId && !isWorkspace && !externalTasks;

  const fetchProjectStages = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("project_stages")
        .select("id, name")
        .eq("project_id", projectId)
        .order("order", { ascending: true });

      if (error) throw error;
      setProjectStages(data || []);
    } catch (error) {
      console.error("Error fetching project stages:", error);
      setError(error as Error);
    }
  };

  const fetchTasks = async () => {
    // If external tasks are provided, use them instead of fetching
    if (externalTasks) {
      setTasks(externalTasks);
      setIsLoading(externalLoading || false);
      setError(externalError || null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from("tasks").select("*");

      if (isGeneral) {
        query = query.eq("is_general", true);
      } else if (projectId) {
        query = query.eq("project_id", projectId);
      } else if (isWorkspace) {
        // Handle workspace-specific query if needed
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data as Task[]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStagesChange = () => {
    fetchProjectStages();
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // If this is a meeting task (from externalTasks)
      const taskToUpdate = tasks.find(t => t.id === taskId);
      
      if (taskToUpdate?.meeting_id) {
        // Update meeting task status
        const { error: meetingTaskError } = await supabase
          .from("meeting_tasks")
          .update({ status: newStatus })
          .eq("id", taskToUpdate.meeting_id);
          
        if (meetingTaskError) throw meetingTaskError;
      }
      
      // Always update tasks table
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Check if this is a meeting task
      const task = tasks.find(t => t.id === taskId);
      
      // If it's a meeting task, also delete from meeting_tasks table
      if (task?.meeting_id) {
        const { error: meetingTaskError } = await supabase
          .from("meeting_tasks")
          .delete()
          .eq("id", task.meeting_id);
          
        if (meetingTaskError) {
          console.error("Error deleting meeting task:", meetingTaskError);
        }
      }
      
      // Delete the task
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      throw error;
    }
  };

  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks);
      setIsLoading(externalLoading || false);
      setError(externalError || null);
    } else {
      fetchTasks();
    }
    
    if (projectId) {
      fetchProjectStages();
    }
  }, [projectId, isWorkspace, externalTasks, externalLoading, externalError]);

  // Group tasks by stage
  useEffect(() => {
    if (!projectId || projectStages.length === 0) return;

    const grouped = projectStages.reduce((acc, stage) => {
      acc[stage.id] = tasks.filter(task => task.stage_id === stage.id);
      return acc;
    }, {} as { [key: string]: Task[] });

    setTasksByStage(grouped);
  }, [tasks, projectStages, projectId]);

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
    deleteTask,
    error
  };
};
