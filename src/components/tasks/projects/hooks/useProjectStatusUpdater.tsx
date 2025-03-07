
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Only proceed if we have a valid project and haven't updated recently
    if (!projectId || !totalTasksCount) return;
    
    // Prevent updating too frequently (once per minute)
    const now = new Date();
    if (lastUpdateTime && (now.getTime() - lastUpdateTime.getTime() < 60000)) {
      return;
    }
    
    const updateProjectStatus = async () => {
      try {
        // Don't update if the project is already completed or cancelled
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
          return;
        }
        
        let newStatus = currentStatus;
        
        // If all tasks are completed (100%), mark project as completed
        if (completionPercentage === 100 && totalTasksCount > 0) {
          newStatus = 'completed';
          
          const { error } = await supabase
            .from('project_tasks')
            .update({ status: newStatus })
            .eq('id', projectId);
            
          if (error) throw error;
          
          toast.success("تم تحديث حالة المشروع إلى مكتمل تلقائياً");
          setLastUpdateTime(new Date());
        }
        // If more than 0% but less than 100%, ensure it's in progress
        else if (completionPercentage > 0 && completionPercentage < 100 && currentStatus === 'pending') {
          newStatus = 'in_progress';
          
          const { error } = await supabase
            .from('project_tasks')
            .update({ status: newStatus })
            .eq('id', projectId);
            
          if (error) throw error;
          
          toast.success("تم تحديث حالة المشروع إلى قيد التنفيذ تلقائياً");
          setLastUpdateTime(new Date());
        }
      } catch (error) {
        console.error("Error updating project status:", error);
      }
    };
    
    updateProjectStatus();
  }, [projectId, currentStatus, completionPercentage, totalTasksCount, lastUpdateTime]);
  
  return null;
};
