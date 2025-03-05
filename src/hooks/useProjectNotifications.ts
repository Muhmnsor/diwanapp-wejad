
import { useInAppNotifications } from '@/hooks/useInAppNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

interface ProjectNotificationParams {
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  userPhone?: string;
}

interface ActivityNotificationParams {
  activityId: string;
  projectId: string;
  activityTitle: string;
  activityDate?: string;
  activityTime?: string;
  activityLocation?: string;
  userId: string;
  userName: string;
  userPhone?: string;
}

export const useProjectNotifications = () => {
  const { createNotification } = useInAppNotifications();
  const { sendNotification } = useNotifications();

  // إشعار تعيين مستخدم لمشروع
  const sendProjectAssignmentNotification = async (params: ProjectNotificationParams) => {
    try {
      return await createNotification({
        title: `تم تعيينك لمشروع ${params.projectTitle}`,
        message: `تم إضافتك كعضو في مشروع ${params.projectTitle}`,
        notification_type: 'project',
        related_entity_id: params.projectId,
        related_entity_type: 'project',
        user_id: params.userId
      });
    } catch (error) {
      console.error('Error sending project assignment notification:', error);
      return null;
    }
  };

  // إشعار نشاط جديد في مشروع
  const sendNewActivityNotification = async (params: ActivityNotificationParams) => {
    try {
      // 1. إرسال إشعار داخل التطبيق
      await createNotification({
        title: `نشاط جديد: ${params.activityTitle}`,
        message: `تم إضافة نشاط جديد "${params.activityTitle}" في المشروع بتاريخ ${params.activityDate}`,
        notification_type: 'project',
        related_entity_id: params.projectId,
        related_entity_type: 'project',
        user_id: params.userId
      });

      // 2. إرسال إشعار واتساب (إذا توفر قالب والرقم)
      if (params.userPhone) {
        const { data: template } = await supabase
          .from('whatsapp_templates')
          .select('id')
          .eq('notification_type', 'project_activity')
          .eq('is_default', true)
          .maybeSingle();

        if (template) {
          await sendNotification({
            type: 'activity',
            projectId: params.projectId,
            activityId: params.activityId,
            recipientPhone: params.userPhone,
            templateId: template.id,
            variables: {
              name: params.userName,
              activity_title: params.activityTitle,
              activity_date: params.activityDate || '',
              activity_time: params.activityTime || '',
              activity_location: params.activityLocation || '',
            }
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error sending new activity notification:', error);
      return false;
    }
  };

  // إشعار تغيير في نشاط
  const sendActivityUpdateNotification = async (params: ActivityNotificationParams, updateType: 'date' | 'location' | 'canceled') => {
    try {
      let title, message;
      
      switch (updateType) {
        case 'date':
          title = `تغيير موعد نشاط ${params.activityTitle}`;
          message = `تم تغيير موعد نشاط ${params.activityTitle} إلى ${params.activityDate} الساعة ${params.activityTime}`;
          break;
        case 'location':
          title = `تغيير مكان نشاط ${params.activityTitle}`;
          message = `تم تغيير مكان نشاط ${params.activityTitle} إلى ${params.activityLocation}`;
          break;
        case 'canceled':
          title = `إلغاء نشاط ${params.activityTitle}`;
          message = `تم إلغاء نشاط ${params.activityTitle} الذي كان مقرراً بتاريخ ${params.activityDate}`;
          break;
      }
      
      // إرسال إشعار داخل التطبيق
      await createNotification({
        title,
        message,
        notification_type: 'project',
        related_entity_id: params.projectId,
        related_entity_type: 'project',
        user_id: params.userId
      });

      return true;
    } catch (error) {
      console.error('Error sending activity update notification:', error);
      return false;
    }
  };

  return {
    sendProjectAssignmentNotification,
    sendNewActivityNotification,
    sendActivityUpdateNotification
  };
};
