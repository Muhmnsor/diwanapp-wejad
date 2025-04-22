
import { useState, useEffect } from "react";
import { Task } from "../types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTasksFetching } from "./useTasksFetching";
import { useTaskStatusManagement } from "./useTaskStatusManagement";

export const useTasksList = (
  projectId?: string,
  meetingId?: string,
  isWorkspace: boolean = false
) => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  
  // Fetch tasks data
  const {
    tasks,
    isLoading,
    tasksByStage,
    setTasks,
    setTasksByStage,
    fetchTasks
  } = useTasksFetching(projectId, meetingId, isWorkspace);
  
  // Task status management
  const { handleStatusChange } = useTaskStatusManagement(
    projectId,
    tasks,
    setTasks,
    tasksByStage,
    setTasksByStage
  );

  // Determine if this is for general tasks
  const isGeneral = !projectId && !meetingId && !isWorkspace;

  // Fetch project stages
  useEffect(() => {
    const fetchProjectStages = async () => {
      if (!projectId || isWorkspace || meetingId) return;
      
      try {
        const { data, error } = await supabase
          .from('project_task_stages')
          .select('id, name')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setProjectStages(data || []);
      } catch (error) {
        console.error("Error fetching project stages:", error);
        toast.error("حدث خطأ أثناء تحميل مراحل المشروع");
      }
    };
    
    fetchProjectStages();
  }, [projectId, isWorkspace, meetingId]);

  // Handle stage changes
  const handleStagesChange = (stages: { id: string; name: string }[]) => {
    setProjectStages(stages);
  };
  
  // Delete task function
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Update tasksByStage
      setTasksByStage(prev => {
        const newTasksByStage = { ...prev };
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].filter(
            task => task.id !== taskId
          );
        });
        return newTasksByStage;
      });
      
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
    setTasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  };
};
