
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

export const useTasksFetching = (projectId: string | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  const fetchTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching tasks for project:", projectId);
      
      // Get tasks from the correct table (tasks) with the correct projectId column
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
          .select('id, name, color')
          .in('id', stageIds);
        
        if (!stagesError && stagesData) {
          // Create a map of stage IDs to names
          const stageMap = stagesData.reduce((map: Record<string, { name: string, color: string }>, stage) => {
            map[stage.id] = { name: stage.name, color: stage.color };
            return map;
          }, {});
          
          // Add stage names to tasks
          tasksWithStageNames = tasksWithStageNames.map(task => ({
            ...task,
            stage_name: task.stage_id ? stageMap[task.stage_id]?.name : undefined,
            stage_color: task.stage_id ? stageMap[task.stage_id]?.color : undefined
          }));
        }
      }
      
      // Add user names for tasks with assignees
      const tasksWithUserData = await Promise.all(tasksWithStageNames.map(async (task) => {
        if (task.assigned_to) {
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
      
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  return {
    tasks,
    isLoading,
    tasksByStage,
    setTasks,
    fetchTasks
  };
};
