
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";

export const useProjectTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
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
      
      const fetchedTasks = data as Task[];
      setTasks(fetchedTasks);
      
      // Calculate stats
      const total = fetchedTasks.length;
      const completed = fetchedTasks.filter(task => task.status === 'completed').length;
      
      // Calculate overdue tasks (due date is in the past and task is not completed)
      const now = new Date();
      const overdue = fetchedTasks.filter(task => 
        task.status !== 'completed' && 
        task.due_date && 
        new Date(task.due_date) < now
      ).length;
      
      // Calculate completion percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setTotalTasksCount(total);
      setCompletedTasksCount(completed);
      setOverdueTasksCount(overdue);
      setCompletionPercentage(percentage);
      
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
    completedTasksCount,
    totalTasksCount, 
    overdueTasksCount,
    completionPercentage,
    refreshTasks: fetchTasks,
    refetchData: fetchTasks // Alias for compatibility
  };
};
