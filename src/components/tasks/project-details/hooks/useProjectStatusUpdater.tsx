
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";

export const useProjectStatusUpdater = () => {
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

  return {
    updateProjectStatus
  };
};
