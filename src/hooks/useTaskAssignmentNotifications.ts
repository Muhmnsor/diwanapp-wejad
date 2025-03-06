
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useInAppNotifications } from "@/contexts/notifications/useInAppNotifications";

interface TaskAssignmentParams {
  taskId: string;
  taskTitle: string;
  assignedUserId: string;
  assignedByUserId?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
}

export const useTaskAssignmentNotifications = () => {
  const { user } = useAuthStore();
  const { createNotification } = useInAppNotifications();

  const sendTaskAssignmentNotification = async (params: TaskAssignmentParams) => {
    if (!params.assignedUserId || params.assignedUserId === user?.id) {
      // Don't send notification if assigning to yourself
      return null;
    }

    try {
      const title = params.projectTitle 
        ? `مهمة جديدة في مشروع "${params.projectTitle}"`
        : 'تم إسناد مهمة جديدة إليك';
        
      const message = params.projectTitle
        ? `تم إسناد مهمة "${params.taskTitle}" إليك في مشروع "${params.projectTitle}"`
        : `تم إسناد مهمة "${params.taskTitle}" إليك`;

      return await createNotification({
        user_id: params.assignedUserId,
        title,
        message,
        notification_type: 'task_assignment',
        related_entity_id: params.taskId,
        related_entity_type: 'task'
      });
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      return null;
    }
  };

  const sendProjectLaunchNotification = async (
    projectId: string,
    projectTitle: string,
    assignedUserIds: string[]
  ) => {
    try {
      // Create notifications for all assigned users
      const notifications = [];
      
      for (const userId of assignedUserIds) {
        if (userId === user?.id) continue; // Skip if it's the current user
        
        notifications.push(
          createNotification({
            user_id: userId,
            title: `تم إطلاق مشروع "${projectTitle}"`,
            message: `تم إطلاق مشروع "${projectTitle}" وتفعيل المهام المسندة إليك. يمكنك الآن البدء في العمل على المهام.`,
            notification_type: 'project_launch',
            related_entity_id: projectId,
            related_entity_type: 'project'
          })
        );
      }
      
      if (notifications.length > 0) {
        await Promise.all(notifications);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending project launch notifications:', error);
      return false;
    }
  };

  return {
    sendTaskAssignmentNotification,
    sendProjectLaunchNotification
  };
};
