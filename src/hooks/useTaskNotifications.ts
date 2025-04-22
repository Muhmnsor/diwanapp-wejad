
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';

interface TaskStatusUpdateParams {
  taskId: string;
  taskTitle: string;
  projectId?: string;
  projectTitle?: string;
  assignedUserId: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

export const useTaskNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // Send notification when task status is updated
  const sendTaskStatusUpdateNotification = async (
    params: TaskStatusUpdateParams,
    newStatus: string
  ) => {
    try {
      if (!params.assignedUserId) {
        console.log('No assigned user ID provided for notification');
        return null;
      }

      let statusText = 'تم تحديث حالة';
      if (newStatus === 'completed') {
        statusText = 'تم إكمال';
      } else if (newStatus === 'in_progress') {
        statusText = 'قيد التنفيذ';
      } else if (newStatus === 'pending') {
        statusText = 'معلقة';
      }

      let message = `${statusText} المهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      console.log('Sending task status update notification to user:', params.assignedUserId);
      console.log('Notification message:', message);
      
      return await createNotification({
        title: `${statusText} المهمة`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: params.projectId ? 'project_task' : 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task status notification:', error);
      return null;
    }
  };

  return {
    sendTaskStatusUpdateNotification
  };
};
