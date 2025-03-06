
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';

interface TaskAssignmentParams {
  taskId: string;
  taskTitle: string;
  projectId?: string;
  projectTitle?: string;
  assignedUserId: string;
  assignedByUserId?: string;
  assignedByUserName?: string;
}

export const useTaskAssignmentNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار إسناد مهمة جديدة
  const sendTaskAssignmentNotification = async (params: TaskAssignmentParams) => {
    try {
      if (!params.assignedUserId) {
        console.log('No assigned user ID provided for notification');
        return null;
      }

      let message = `تم إسناد المهمة "${params.taskTitle}" إليك`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.assignedByUserName) {
        message += ` بواسطة ${params.assignedByUserName}`;
      }
      
      console.log('Sending task assignment notification to user:', params.assignedUserId);
      
      return await createNotification({
        title: `تم إسناد مهمة جديدة`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: params.projectId ? 'project_task' : 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      return null;
    }
  };

  return {
    sendTaskAssignmentNotification
  };
};
