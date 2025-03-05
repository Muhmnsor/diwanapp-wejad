import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';

interface TaskNotificationParams {
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

  // إشعار تغيير حالة المهمة
  const sendTaskStatusUpdateNotification = async (params: TaskNotificationParams, newStatus: string) => {
    try {
      // ترجمة حالة المهمة
      const statusTranslation: Record<string, string> = {
        'pending': 'بانتظار البدء',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'late': 'متأخرة',
        'canceled': 'ملغية'
      };
      
      const statusText = statusTranslation[newStatus] || newStatus;
      
      let message = `تم تحديث حالة المهمة "${params.taskTitle}" إلى ${statusText}`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title: `تحديث حالة المهمة`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: params.projectId ? 'project_task' : 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task status update notification:', error);
      return null;
    }
  };

  // إشعار إضافة تعليق على المهمة
  const sendTaskCommentNotification = async (params: TaskNotificationParams) => {
    try {
      let message = `تمت إضافة تعليق جديد على المهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title: `تعليق جديد على المهمة`,
        message,
        notification_type: 'comment',
        related_entity_id: params.taskId,
        related_entity_type: params.projectId ? 'project_task' : 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task comment notification:', error);
      return null;
    }
  };
  
  // إشعار إضافة مرفق للمهمة
  const sendTaskAttachmentNotification = async (params: TaskNotificationParams) => {
    try {
      let message = `تمت إضافة مرفق جديد للمهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title: `مرفق جديد للمهمة`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: params.projectId ? 'project_task' : 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task attachment notification:', error);
      return null;
    }
  };

  return {
    sendTaskStatusUpdateNotification,
    sendTaskCommentNotification,
    sendTaskAttachmentNotification
  };
};
