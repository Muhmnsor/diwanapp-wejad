
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

interface IdeaNotificationParams {
  ideaId: string;
  ideaTitle: string;
  userId: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

export const useIdeaNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار إضافة تعليق على فكرة
  const sendIdeaCommentNotification = async (params: IdeaNotificationParams) => {
    try {
      let message = `تمت إضافة تعليق جديد على الفكرة "${params.ideaTitle}"`;
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title: `تعليق جديد على فكرة`,
        message,
        notification_type: 'comment',
        related_entity_id: params.ideaId,
        related_entity_type: 'idea',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending idea comment notification:', error);
      return null;
    }
  };

  // إشعار تغيير حالة فكرة
  const sendIdeaStatusUpdateNotification = async (params: IdeaNotificationParams, newStatus: string) => {
    try {
      // ترجمة حالة الفكرة
      const statusTranslation: Record<string, string> = {
        'under_review': 'قيد المراجعة',
        'approved': 'معتمدة',
        'rejected': 'مرفوضة',
        'implemented': 'منفذة',
        'archived': 'مؤرشفة'
      };
      
      const statusText = statusTranslation[newStatus] || newStatus;
      
      let message = `تم تحديث حالة الفكرة "${params.ideaTitle}" إلى ${statusText}`;
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title: `تحديث حالة الفكرة`,
        message,
        notification_type: 'idea',
        related_entity_id: params.ideaId,
        related_entity_type: 'idea',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending idea status update notification:', error);
      return null;
    }
  };

  return {
    sendIdeaCommentNotification,
    sendIdeaStatusUpdateNotification
  };
};
