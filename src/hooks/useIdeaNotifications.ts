
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

interface IdeaNotificationParams {
  ideaId: string;
  ideaTitle: string;
  ownerId: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  commentContent?: string;
}

export const useIdeaNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار تغيير حالة الفكرة
  const sendIdeaStatusUpdateNotification = async (params: IdeaNotificationParams, newStatus: string) => {
    try {
      let statusText;
      switch (newStatus) {
        case 'under_review':
          statusText = 'قيد المراجعة';
          break;
        case 'pending_decision':
          statusText = 'بانتظار القرار';
          break;
        case 'approved':
          statusText = 'تمت الموافقة عليها';
          break;
        case 'rejected':
          statusText = 'تم رفضها';
          break;
        default:
          statusText = newStatus;
      }

      let message = `تم تغيير حالة الفكرة "${params.ideaTitle}" إلى ${statusText}`;
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }

      return await createNotification({
        title: `تحديث حالة الفكرة: ${params.ideaTitle}`,
        message,
        notification_type: 'user',
        related_entity_id: params.ideaId,
        related_entity_type: 'idea',
        user_id: params.ownerId
      });
    } catch (error) {
      console.error('Error sending idea status update notification:', error);
      return null;
    }
  };

  // إشعار إضافة تعليق جديد
  const sendNewCommentNotification = async (params: IdeaNotificationParams) => {
    try {
      // لا نرسل إشعار إذا كان التعليق من نفس صاحب الفكرة
      if (params.updatedByUserId === params.ownerId) {
        return null;
      }

      let message = `تم إضافة تعليق جديد على فكرتك "${params.ideaTitle}"`;
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
        title: `تعليق جديد على فكرتك`,
        message,
        notification_type: 'comment',
        related_entity_id: params.ideaId,
        related_entity_type: 'idea',
        user_id: params.ownerId
      });
    } catch (error) {
      console.error('Error sending new comment notification:', error);
      return null;
    }
  };

  // إشعار انتهاء فترة النقاش
  const sendDiscussionEndedNotification = async (params: IdeaNotificationParams) => {
    try {
      const message = `انتهت فترة النقاش للفكرة "${params.ideaTitle}" وتم تحويلها إلى حالة انتظار القرار`;

      return await createNotification({
        title: `انتهاء فترة النقاش`,
        message,
        notification_type: 'user',
        related_entity_id: params.ideaId,
        related_entity_type: 'idea',
        user_id: params.ownerId
      });
    } catch (error) {
      console.error('Error sending discussion ended notification:', error);
      return null;
    }
  };

  return {
    sendIdeaStatusUpdateNotification,
    sendNewCommentNotification,
    sendDiscussionEndedNotification
  };
};
