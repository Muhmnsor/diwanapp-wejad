
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectStatusUpdaterProps {
  projectId: string;
  currentStatus: string;
  completionPercentage: number;
  totalTasksCount: number;
}

export const useProjectStatusUpdater = ({
  projectId,
  currentStatus,
  completionPercentage,
  totalTasksCount
}: ProjectStatusUpdaterProps) => {
  
  useEffect(() => {
    const updateProjectStatusIfNeeded = async () => {
      if (completionPercentage === 100 && currentStatus !== 'completed' && totalTasksCount > 0) {
        console.log(`Project ${projectId} is 100% complete, updating status to completed`);
        
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ status: 'completed' })
          .eq('id', projectId);
          
        if (updateError) {
          console.error("Error updating project status:", updateError);
        }
      }
    };
    
    updateProjectStatusIfNeeded();
  }, [projectId, currentStatus, completionPercentage, totalTasksCount]);
};
