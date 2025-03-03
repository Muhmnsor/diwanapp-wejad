import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";

export const useTasksList = (projectId: string | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  const fetchTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching tasks for project:", projectId);
      
      // Get tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      console.log("Fetched tasks:", data);
      
      // Add stage names by fetching stages separately
      let tasksWithStageNames = [...(data || [])];
      
      // Get all stage IDs used in tasks
      const stageIds = tasksWithStageNames
        .map(task => task.stage_id)
        .filter(id => id !== null) as string[];
      
      // If there are stage IDs, fetch their names
      if (stageIds.length > 0) {
        const { data: stagesData, error: stagesError } = await supabase
          .from('project_stages')
          .select('id, name')
          .in('id', stageIds);
        
        if (!stagesError && stagesData) {
          // Create a map of stage IDs to names
          const stageMap = stagesData.reduce((map: Record<string, string>, stage) => {
            map[stage.id] = stage.name;
            return map;
          }, {});
          
          // Add stage names to tasks
          tasksWithStageNames = tasksWithStageNames.map(task => ({
            ...task,
            stage_name: task.stage_id ? stageMap[task.stage_id] : undefined
          }));
        }
      }
      
      // Add user names for tasks with assignees
      const tasksWithUserData = await Promise.all(tasksWithStageNames.map(async (task) => {
        if (task.assigned_to) {
          // Check if it's a custom assignee
          if (task.assigned_to.startsWith('custom:')) {
            return {
              ...task,
              assigned_user_name: task.assigned_to.replace('custom:', '')
            };
          }
          
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.assigned_to)
            .single();
          
          if (!userError && userData) {
            return {
              ...task,
              assigned_user_name: userData.display_name || userData.email
            };
          }
        }
        
        return task;
      }));
      
      // Process tasks by stage
      const tasksByStageMap: Record<string, Task[]> = {};
      
      tasksWithUserData.forEach(task => {
        if (task.stage_id) {
          if (!tasksByStageMap[task.stage_id]) {
            tasksByStageMap[task.stage_id] = [];
          }
          tasksByStageMap[task.stage_id].push(task);
        }
      });
      
      setTasks(tasksWithUserData);
      setTasksByStage(tasksByStageMap);
      
      // Update project status based on task completion
      updateProjectStatus(projectId, tasksWithUserData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, tasks: Task[]) => {
    try {
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      
      // Check for overdue tasks
      const now = new Date();
      const overdue = tasks.filter(task => {
        return task.status !== 'completed' && 
              task.due_date && 
              new Date(task.due_date) < now;
      }).length;
      
      let newStatus = 'pending';
      
      if (total === 0) {
        return; // No tasks, don't update status
      } else if (completed === total) {
        newStatus = 'completed';
      } else if (completed > 0) {
        newStatus = 'in_progress';
      } else if (overdue > 0) {
        newStatus = 'delayed';
      }
      
      // Get current project status
      const { data: projectData, error: projectError } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('id', projectId)
        .single();
        
      if (!projectError && projectData && projectData.status !== newStatus) {
        console.log(`Updating project status from ${projectData.status} to ${newStatus}`);
        
        // Update project status
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ status: newStatus })
          .eq('id', projectId);
          
        if (updateError) {
          console.error("Error updating project status:", updateError);
        }
      }
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const handleStagesChange = (stages: { id: string; name: string }[]) => {
    setProjectStages(stages);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error("Error updating task status:", error);
        toast.error("حدث خطأ أثناء تحديث حالة المهمة");
        return;
      }

      // Update local state to reflect the change
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );

      // Update tasksByStage state
      setTasksByStage(prevTasksByStage => {
        const newTasksByStage = { ...prevTasksByStage };
        
        // Update the task status in each stage
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus } 
              : task
          );
        });
        
        return newTasksByStage;
      });
      
      // After updating task status, update project status
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      await updateProjectStatus(projectId as string, updatedTasks);

      toast.success(newStatus === 'completed' 
        ? "تم إكمال المهمة بنجاح" 
        : "تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
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
    fetchTasks
  };
};
