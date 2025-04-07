
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

    let query = supabase.from('tasks').select('*');

    if (isWorkspace) {
      query = query.eq('workspace_id', projectId);
    } else if (isGeneral) {
      query = query.eq('is_general', true);
    } else {
      query = query.eq('project_id', projectId);
    }

    const { data: tasksData, error } = await query;
    if (error) throw error;

    if (tasksData) {
      // Filter out tasks with non-custom assigned_to values
      const userIds = tasksData
        .filter(task => !task.assigned_to.startsWith('custom:'))
        .map(task => task.assigned_to);
      // Get distinct user IDs
      const distinctUserIds = [...new Set(userIds)];

      // Fetch all profiles for these user IDs in one go
      let profilesMap = {};
      if (distinctUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', distinctUserIds);

        if (!profilesError && profilesData) {
          // Build a mapping from user ID to profile info
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }

      // Format tasks using the pre-fetched profiles
      const formattedTasks = tasksData.map((task) => {
        if (task.assigned_to.startsWith('custom:')) {
          return {
            ...task,
            assigned_user_name: task.assigned_to.replace('custom:', '')
          };
        }

        // Use the mapping to get the profile data
        const userProfile = profilesMap[task.assigned_to];
        if (userProfile) {
          return {
            ...task,
            assigned_user_name: userProfile.display_name || userProfile.email
          };
        }

        // Fallback if no profile is found
        return {
          ...task,
          assigned_user_name: ''
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

