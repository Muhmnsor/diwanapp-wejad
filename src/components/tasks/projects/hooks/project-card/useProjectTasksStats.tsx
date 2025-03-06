
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTasksStats = (projectId: string, projectStatus: string) => {
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        setCompletionPercentage(percentage);
        
        if (percentage === 100 && projectStatus !== 'completed' && total > 0) {
          console.log(`Project ${projectId} is 100% complete, updating status to completed`);
          
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({ status: 'completed' })
            .eq('id', projectId);
            
          if (updateError) {
            console.error("Error updating project status:", updateError);
          }
        }
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [projectId, projectStatus]);

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    completionPercentage,
    isLoading
  };
};
