
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/types/task";
import { useCachedQuery } from "@/hooks/useCachedQuery";

export const useTasksFetching = (projectId: string | undefined) => {
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});
  
  // Use enhanced caching for tasks
  const { 
    data: tasks = [], 
    isLoading, 
    refetch 
  } = useCachedQuery<Task[]>(
    ['project-tasks', projectId],
    async () => {
      if (!projectId) return [];
      
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
        
        return tasksWithUserData as Task[];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
    {
      enabled: !!projectId,
      // Enhanced caching options
      cacheDuration: 2 * 60 * 1000, // 2 minutes
      cacheStorage: 'memory',
      cachePrefix: 'project',
      useCompression: true,
      compressionThreshold: 1024,
      cachePriority: 'high',
      batchUpdates: true,
      tags: ['project-tasks', `project-${projectId}`],
      refreshStrategy: 'lazy',
      refreshThreshold: 50,
      offlineFirst: true
    }
  );
  
  // Process tasks by stage whenever tasks change
  useEffect(() => {
    const processTasksByStage = () => {
      const tasksByStageMap: Record<string, Task[]> = {};
      
      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          if (task.stage_id) {
            if (!tasksByStageMap[task.stage_id]) {
              tasksByStageMap[task.stage_id] = [];
            }
            tasksByStageMap[task.stage_id].push(task);
          }
        });
      }
      
      setTasksByStage(tasksByStageMap);
    };
    
    processTasksByStage();
  }, [tasks]);
  
  // Memoized fetch function for external use
  const fetchTasks = useCallback(() => {
    return refetch();
  }, [refetch]);
  
  return {
    tasks,
    isLoading,
    tasksByStage,
    setTasks: (newTasks: Task[]) => {},  // This is no longer used but kept for API compatibility
    fetchTasks
  };
};
