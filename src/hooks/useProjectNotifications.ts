
import { supabase } from '@/integrations/supabase/client';
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';
import { toast } from 'sonner';

interface ProjectNotificationParams {
  projectId: string;
  projectTitle: string;
  userId: string;
  updatedByUserName?: string;
  activityId?: string;
  activityTitle?: string;
}

export const useProjectNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار إضافة نشاط جديد للمشروع
  const sendNewActivityNotification = async (params: ProjectNotificationParams) => {
    try {
      let message = `تم إضافة نشاط جديد للمشروع "${params.projectTitle}"`;
      if (params.activityTitle) {
        message += `: ${params.activityTitle}`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }

      return await createNotification({
        title: `نشاط جديد في المشروع`,
        message,
        notification_type: 'project',
        related_entity_id: params.projectId,
        related_entity_type: 'project',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending new activity notification:', error);
      return null;
    }
  };

  // إشعار تحديث المشروع
  const sendProjectUpdateNotification = async (params: ProjectNotificationParams, updateType: 'date' | 'location' | 'status') => {
    try {
      let title, message;
      
      switch (updateType) {
        case 'date':
          title = `تحديث موعد المشروع`;
          message = `تم تحديث مواعيد المشروع "${params.projectTitle}"`;
          break;
        case 'location':
          title = `تحديث موقع المشروع`;
          message = `تم تحديث موقع المشروع "${params.projectTitle}"`;
          break;
        case 'status':
          title = `تحديث حالة المشروع`;
          message = `تم تحديث حالة المشروع "${params.projectTitle}"`;
          break;
      }
      
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      return await createNotification({
        title,
        message,
        notification_type: 'project',
        related_entity_id: params.projectId,
        related_entity_type: 'project',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending project update notification:', error);
      return null;
    }
  };

  return {
    sendNewActivityNotification,
    sendProjectUpdateNotification
  };
};
