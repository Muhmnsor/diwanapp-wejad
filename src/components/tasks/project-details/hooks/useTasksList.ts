
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksList = (projectId?: string, isWorkspace = false) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});
  
  // Determine if this is a general tasks view (no project ID)
  const isGeneral = !projectId || projectId === "";
  
  // Fetch tasks
  // Modified fetchTasks function
const fetchTasks = useCallback(async () => {
  setIsLoading(true);
  try {
    console.log(
      `Fetching tasks for ${isWorkspace ? 'workspace' : isGeneral ? 'general' : 'project'} ID: ${projectId || 'none'}`
    );

    // Build query with joined profile data and stage data
    let query = supabase
      .from('tasks')
      .select(`
        *,
        profiles:assigned_to (display_name, email),
        stage:stage_id (name)
      `);

    // Apply the appropriate filter
    if (isWorkspace) {
      query = query.eq('workspace_id', projectId);
    } else if (isGeneral) {
      query = query.eq('is_general', true);
    } else {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data) {
      // Transform data to extract profiles and stage information
      const formattedTasks = data.map(task => {
        // Handle custom assignees (no database lookup needed)
        if (task.assigned_to && task.assigned_to.startsWith('custom:')) {
          return {
            ...task,
            assigned_user_name: task.assigned_to.replace('custom:', ''),
            stage_name: task.stage?.name || ''
          };
        }

        // Extract profile info from the joined data
        let assignedUserName = '';
        if (task.profiles) {
          assignedUserName = task.profiles.display_name || task.profiles.email || '';
        }

        return {
          ...task,
          assigned_user_name: assignedUserName,
          stage_name: task.stage?.name || ''
        };
      });

      setTasks(formattedTasks);
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    toast.error("حدث خطأ أثناء تحميل المهام");
  } finally {
    setIsLoading(false);
  }
}, [projectId, isGeneral, isWorkspace]);

  
  // Fetch project stages if this is a project view
  const fetchProjectStages = useCallback(async () => {
    if (isGeneral || isWorkspace || !projectId) {
      setProjectStages([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjectStages(data.map(stage => ({
          id: stage.id,
          name: stage.name
        })));
      } else {
        // Create default stages if none exist
        const defaultStages = [
          { name: "تخطيط", color: "blue" },
          { name: "تنفيذ", color: "amber" },
          { name: "مراجعة", color: "purple" },
          { name: "اكتمال", color: "green" }
        ];
        
        for (const stage of defaultStages) {
          await supabase.from('project_stages').insert({
            project_id: projectId,
            name: stage.name,
            color: stage.color
          });
        }
        
        // Fetch again
        const { data: newData } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', projectId);
          
        if (newData) {
          setProjectStages(newData.map(stage => ({
            id: stage.id,
            name: stage.name
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching project stages:", error);
    }
  }, [projectId, isGeneral, isWorkspace]);
  
  // Group tasks by stage
  useEffect(() => {
    const groupTasksByStage = () => {
      const grouped: Record<string, Task[]> = {};
      
      // Initialize with empty arrays for all stages
      projectStages.forEach(stage => {
        grouped[stage.id] = [];
      });
      
      // Add tasks to their respective stages
      tasks.forEach(task => {
        if (task.stage_id && grouped[task.stage_id]) {
          grouped[task.stage_id].push(task);
        } else if (projectStages.length > 0) {
          // If task has no stage, add to first stage
          const firstStageId = projectStages[0].id;
          grouped[firstStageId] = [...(grouped[firstStageId] || []), task];
        }
      });
      
      setTasksByStage(grouped);
    };
    
    if (!isGeneral && !isWorkspace) {
      groupTasksByStage();
    }
  }, [tasks, projectStages, isGeneral, isWorkspace]);
  
  // Load data on mount and when projectId changes
  useEffect(() => {
    fetchTasks();
    fetchProjectStages();
  }, [fetchTasks, fetchProjectStages]);
  
  // Filter tasks based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === activeTab));
    }
  }, [tasks, activeTab]);
  
  // Handle stage changes
  const handleStagesChange = () => {
    fetchProjectStages();
  };
  
  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );
      
      toast.success("تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };
  
  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      throw error;
    }
  };
  
  return {
    tasks,
    filteredTasks,
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

