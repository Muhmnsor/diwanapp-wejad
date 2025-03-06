
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { useTasksFetching } from "./useTasksFetching";
import { useProjectStatusUpdater } from "./useProjectStatusUpdater";
import { toast } from "sonner";
import { useProjectPermissions } from "@/hooks/useProjectPermissions";

export const useTasksList = (projectId?: string) => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<any[]>([]);
  const isGeneral = !projectId;

  const { tasks, isLoading, tasksByStage, setTasks, fetchTasks } = useTasksFetching(projectId);
  const { updateProjectStatus } = useProjectStatusUpdater();
  const { isDraftProject } = useProjectPermissions(projectId);

  useEffect(() => {
    if (projectId) {
      fetchProjectStages();
    }
  }, [projectId]);

  const fetchProjectStages = async () => {
    if (!projectId) return;
    
    try {
      console.log("Fetching project stages for:", projectId);
      
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log(`Found ${data?.length || 0} stages for project ${projectId}`);
      setProjectStages(data || []);
    } catch (error) {
      console.error("Error fetching project stages:", error);
    }
  };

  const handleStagesChange = (stages: any[]) => {
    setProjectStages(stages);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Update the task status
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update the local state
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      // Update project status based on tasks
      if (projectId) {
        await updateProjectStatus(projectId, updatedTasks);
      }
      
      toast.success(`تم تحديث حالة المهمة بنجاح إلى ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  // Helper function to get status text in Arabic
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'قيد الانتظار';
      case 'in_progress': return 'قيد التنفيذ';
      case 'cancelled': return 'ملغية';
      case 'draft': return 'مسودة';
      default: return status;
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
    isDraftProject
  };
};
