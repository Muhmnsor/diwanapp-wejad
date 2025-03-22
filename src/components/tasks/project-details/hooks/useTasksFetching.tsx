
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

export const useTasksFetching = (
  projectId?: string, 
  isWorkspace: boolean = false,
  externalTasks?: Task[],
  externalLoading?: boolean,
  externalError?: Error | null
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  // Use external tasks if provided
  useEffect(() => {
    if (externalTasks) {
      setTasks(externalTasks);
      setIsLoading(externalLoading || false);
      setError(externalError || null);
      
      // Organize tasks by stage
      const groupedTasks: Record<string, Task[]> = {};
      externalTasks.forEach(task => {
        const stageId = task.stage_id || 'unassigned';
        if (!groupedTasks[stageId]) {
          groupedTasks[stageId] = [];
        }
        groupedTasks[stageId].push(task);
      });
      
      setTasksByStage(groupedTasks);
    } else {
      // Only fetch tasks if external tasks are not provided
      fetchTasks();
    }
  }, [externalTasks, externalLoading, externalError]);

  const fetchTasks = async () => {
    // Don't fetch if we're using external tasks
    if (externalTasks) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase.from('tasks').select('*');
      
      if (projectId && !isWorkspace) {
        query = query.eq('project_id', projectId).eq('is_general', false);
      } else if (isWorkspace) {
        query = query.eq('workspace_id', projectId);
      } else {
        query = query.eq('is_general', true);
      }
      
      const { data, error: apiError } = await query.order('created_at', { ascending: false });
      
      if (apiError) throw apiError;
      
      setTasks(data as Task[]);
      
      // Organize tasks by stage
      const groupedTasks: Record<string, Task[]> = {};
      data.forEach(task => {
        const stageId = task.stage_id || 'unassigned';
        if (!groupedTasks[stageId]) {
          groupedTasks[stageId] = [];
        }
        groupedTasks[stageId].push(task);
      });
      
      setTasksByStage(groupedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tasks,
    isLoading,
    error,
    tasksByStage,
    setTasks,
    setTasksByStage,
    fetchTasks
  };
};
