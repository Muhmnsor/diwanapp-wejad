
import { supabase } from '@/integrations/supabase/client';
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';
import { toast } from 'sonner';

interface IdeaNotificationParams {
  ideaId: string;
  ideaTitle: string;
  userId: string;
  createdByUserName?: string;
  actionType: 'comment' | 'status' | 'vote' | 'decision';
  statusValue?: string;
}

export const useIdeaNotifications = () => {
  const { createNotification } = useInAppNotifications();

  const sendIdeaCommentNotification = async (params: IdeaNotificationParams) => {
    try {
      let message = `تم إضافة تعليق جديد على فكرة "${params.ideaTitle}"`;
      if (params.createdByUserName) {
        message += ` بواسطة ${params.createdByUserName}`;
      }

      return await createNotification({
        title: `تعليق جديد على الفكرة`,
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

  const sendIdeaStatusUpdateNotification = async (params: IdeaNotificationParams) => {
    try {
      const statusTranslation: Record<string, string> = {
        'pending': 'قيد الانتظار',
        'in_review': 'قيد المراجعة',
        'approved': 'تمت الموافقة',
        'rejected': 'مرفوضة',
        'on_hold': 'معلقة'
      };
      
      const statusText = params.statusValue ? (statusTranslation[params.statusValue] || params.statusValue) : '';
      
      let message = `تم تحديث حالة فكرة "${params.ideaTitle}" إلى ${statusText}`;
      if (params.createdByUserName) {
        message += ` بواسطة ${params.createdByUserName}`;
      }

      return await createNotification({
        title: `تحديث حالة الفكرة`,
        message,
        notification_type: 'user',
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
