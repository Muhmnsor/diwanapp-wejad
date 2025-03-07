
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";

export const useProjectTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch tasks for this project
      const { data, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        throw tasksError;
      }
      
      setTasks(data as Task[]);
    } catch (err) {
      console.error("Error fetching project tasks:", err);
      setError("فشل في تحميل المهام، يرجى المحاولة لاحقًا");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks
  };
};
