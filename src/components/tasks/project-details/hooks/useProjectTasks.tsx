
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";

export const useProjectTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tasks
        const { data, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });
          
        if (tasksError) throw tasksError;
        
        setTasks(data || []);
        
        // Calculate statistics
        const total = data ? data.length : 0;
        const completed = data ? data.filter(task => task.status === 'completed').length : 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setCompletionPercentage(percentage);
        
      } catch (err: any) {
        console.error("Error fetching project tasks:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
    
    // Set up real-time updates
    if (projectId) {
      const channel = supabase
        .channel(`project-tasks-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
          },
          () => {
            // Refetch tasks when changes occur
            fetchTasks();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId]);
  
  return { 
    tasks, 
    isLoading, 
    error,
    completedTasksCount,
    totalTasksCount,
    completionPercentage
  };
};
