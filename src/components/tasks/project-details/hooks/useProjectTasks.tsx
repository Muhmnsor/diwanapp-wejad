
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTasks = (projectId: string) => {
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        // Fetch tasks for this project
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        // Calculate metrics
        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        // Calculate overdue tasks (tasks with due_date in the past and not completed)
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);

        // Check if project status needs updating
        if (total > 0) {
          let newStatus = 'pending';
          
          if (completed === total) {
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
        }
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [projectId]);

  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    completionPercentage,
    isLoading
  };
};
