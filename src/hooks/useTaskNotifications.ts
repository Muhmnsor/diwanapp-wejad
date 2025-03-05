
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

interface TaskNotificationParams {
  taskId: string;
  taskTitle: string;
  projectId?: string;
  projectTitle?: string;
  assignedUserId: string;
  dueDate?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  commentContent?: string;
}

export const useTaskNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار تعيين مهمة جديدة
  const sendTaskAssignmentNotification = async (params: TaskNotificationParams) => {
    try {
      let message = `تم تعيينك لمهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.dueDate) {
        message += ` - تاريخ التسليم: ${params.dueDate}`;
      }

      return await createNotification({
        title: `مهمة جديدة: ${params.taskTitle}`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
      return null;
    }
  };

  // إشعار تغيير حالة المهمة
  const sendTaskStatusUpdateNotification = async (params: TaskNotificationParams, newStatus: string) => {
    try {
      // لا نرسل إشعار إذا كان التحديث من نفس المستخدم المسند إليه المهمة
      if (params.updatedByUserId === params.assignedUserId) {
        return null;
      }

      let statusText;
      switch (newStatus) {
        case 'in_progress':
          statusText = 'قيد التنفيذ';
          break;
        case 'completed':
          statusText = 'مكتملة';
          break;
        case 'canceled':
          statusText = 'ملغاة';
          break;
        default:
          statusText = newStatus;
      }

      let message = `تم تغيير حالة المهمة "${params.taskTitle}" إلى ${statusText}`;
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }

      return await createNotification({
        title: `تحديث المهمة: ${params.taskTitle}`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending task status update notification:', error);
      return null;
    }
  };

  // إشعار اقتراب موعد المهمة
  const sendTaskDueDateReminderNotification = async (params: TaskNotificationParams) => {
    try {
      let message = `تذكير: موعد تسليم المهمة "${params.taskTitle}" يقترب`;
      if (params.dueDate) {
        message += ` (${params.dueDate})`;
      }
      if (params.projectTitle) {
        message += ` - مشروع: ${params.projectTitle}`;
      }

      return await createNotification({
        title: `اقتراب موعد تسليم المهمة`,
        message,
        notification_type: 'task',
        related_entity_id: params.taskId,
        related_entity_type: 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending due date reminder notification:', error);
      return null;
    }
  };

  // إشعار إضافة تعليق جديد
  const sendNewCommentNotification = async (params: TaskNotificationParams) => {
    try {
      // لا نرسل إشعار إذا كان التعليق من نفس المستخدم المسند إليه المهمة
      if (params.updatedByUserId === params.assignedUserId) {
        return null;
      }

      let message = `تم إضافة تعليق جديد على المهمة "${params.taskTitle}"`;
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      if (params.commentContent) {
        const truncatedComment = params.commentContent.length > 50 
          ? params.commentContent.substring(0, 50) + '...' 
          : params.commentContent;
        message += `: "${truncatedComment}"`;
      }

      return await createNotification({
        title: `تعليق جديد على المهمة`,
        message,
        notification_type: 'comment',
        related_entity_id: params.taskId,
        related_entity_type: 'task',
        user_id: params.assignedUserId
      });
    } catch (error) {
      console.error('Error sending new comment notification:', error);
      return null;
    }
  };

  return {
    sendTaskAssignmentNotification,
    sendTaskStatusUpdateNotification,
    sendTaskDueDateReminderNotification,
    sendNewCommentNotification
  };
};
