
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useNotificationQueue } from "@/hooks/useNotificationQueue";
import { NotificationType } from "@/contexts/notifications/types";
import { toast } from "sonner";

export const useLaunchProject = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const { sendProjectLaunchNotification } = useTaskAssignmentNotifications();
  const { queueMultipleNotifications } = useNotificationQueue();

  const getAssignedUsers = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('assigned_to')
        .eq('project_id', projectId)
        .not('assigned_to', 'is', null);

      if (error) throw error;

      // Create a Set to track unique user IDs
      const uniqueUserIds = new Set<string>();
      
      // Add all valid user IDs to the set
      data.forEach(task => {
        if (task.assigned_to && !task.assigned_to.startsWith('custom:')) {
          uniqueUserIds.add(task.assigned_to);
        }
      });

      return Array.from(uniqueUserIds);
    } catch (error) {
      console.error("Error getting assigned users:", error);
      return [];
    }
  };

  const launchProject = async (projectId: string, projectName: string) => {
    setIsLaunching(true);
    
    try {
      // 1. Update the project draft status
      const { error: projectUpdateError } = await supabase
        .from('project_tasks')
        .update({ 
          is_draft: false,
          launch_date: new Date().toISOString()
        })
        .eq('id', projectId);

      if (projectUpdateError) throw projectUpdateError;

      // 2. Get all assigned users for notifications
      const assignedUserIds = await getAssignedUsers(projectId);
      
      // 3. Queue notifications for all assigned users
      if (assignedUserIds.length > 0) {
        const notifications = assignedUserIds.map(userId => ({
          user_id: userId,
          title: `تم إطلاق مشروع "${projectName}"`,
          message: `تم إطلاق مشروع "${projectName}" وتفعيل المهام المسندة إليك. يمكنك الآن البدء في العمل على المهام.`,
          notification_type: 'project_launch' as NotificationType,
          related_entity_id: projectId,
          related_entity_type: 'project',
          priority: 10 // High priority for project launch
        }));
        
        await queueMultipleNotifications(notifications);
        
        // Also send through the dedicated function
        await sendProjectLaunchNotification(projectId, projectName, assignedUserIds);
      }

      toast.success('تم إطلاق المشروع بنجاح');
      return true;
    } catch (error) {
      console.error("Error launching project:", error);
      toast.error('حدث خطأ أثناء إطلاق المشروع');
      return false;
    } finally {
      setIsLaunching(false);
    }
  };

  return {
    launchProject,
    isLaunching
  };
};
