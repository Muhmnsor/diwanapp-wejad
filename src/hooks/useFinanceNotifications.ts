
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

interface FinanceNotificationParams {
  resourceId?: string;
  resourceTitle?: string;
  amount?: number;
  userId: string;
  updatedByUserName?: string;
  targetId?: string;
  targetName?: string;
}

export const useFinanceNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار إضافة مورد مالي جديد
  const sendNewResourceNotification = async (params: FinanceNotificationParams) => {
    try {
      let message = `تم إضافة مورد مالي جديد`;
      if (params.resourceTitle) {
        message += `: ${params.resourceTitle}`;
      }
      if (params.amount) {
        message += ` بمبلغ ${params.amount.toLocaleString()} ريال`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }

      return await createNotification({
        title: `مورد مالي جديد`,
        message,
        notification_type: 'user',
        related_entity_id: params.resourceId,
        related_entity_type: 'finance',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending new resource notification:', error);
      return null;
    }
  };

  // إشعار تحديث هدف مالي
  const sendFinancialTargetUpdateNotification = async (params: FinanceNotificationParams) => {
    try {
      let message = `تم تحديث الهدف المالي`;
      if (params.targetName) {
        message += ` "${params.targetName}"`;
      }
      if (params.amount) {
        message += ` إلى ${params.amount.toLocaleString()} ريال`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }

      return await createNotification({
        title: `تحديث هدف مالي`,
        message,
        notification_type: 'user',
        related_entity_id: params.targetId,
        related_entity_type: 'finance',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending financial target update notification:', error);
      return null;
    }
  };

  return {
    sendNewResourceNotification,
    sendFinancialTargetUpdateNotification
  };
};
