
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useInAppNotifications } from '@/hooks/useInAppNotifications';

interface EventNotificationParams {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  recipientName: string;
  recipientPhone: string;
  recipientId?: string;
  registrationId?: string;
}

export const useEventNotifications = () => {
  const { sendNotification } = useNotifications();
  const { createNotification } = useInAppNotifications();

  // إشعار التسجيل في فعالية
  const sendRegistrationNotification = async (params: EventNotificationParams) => {
    try {
      // 1. إرسال إشعار داخل التطبيق
      await createNotification({
        title: `تم التسجيل في فعالية ${params.eventTitle}`,
        message: `تم تسجيلك بنجاح في فعالية ${params.eventTitle} بتاريخ ${params.eventDate}`,
        notification_type: 'event',
        related_entity_id: params.eventId,
        related_entity_type: 'event',
        user_id: params.recipientId
      });

      // 2. إرسال إشعار واتساب (إذا توفر قالب)
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .maybeSingle();

      if (template) {
        await sendNotification({
          type: 'registration',
          eventId: params.eventId,
          registrationId: params.registrationId,
          recipientPhone: params.recipientPhone,
          templateId: template.id,
          variables: {
            name: params.recipientName,
            event_title: params.eventTitle,
            event_date: params.eventDate || '',
            event_time: params.eventTime || '',
            event_location: params.eventLocation || '',
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending registration notification:', error);
      return false;
    }
  };

  // إشعار تذكير بفعالية
  const sendReminderNotification = async (params: EventNotificationParams) => {
    try {
      // 1. إرسال إشعار داخل التطبيق
      await createNotification({
        title: `تذكير بفعالية ${params.eventTitle}`,
        message: `تذكير: فعالية ${params.eventTitle} ستقام غداً الساعة ${params.eventTime} في ${params.eventLocation}`,
        notification_type: 'event',
        related_entity_id: params.eventId,
        related_entity_type: 'event',
        user_id: params.recipientId
      });

      // 2. إرسال إشعار واتساب (إذا توفر قالب)
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_reminder')
        .eq('is_default', true)
        .maybeSingle();

      if (template) {
        await sendNotification({
          type: 'reminder',
          eventId: params.eventId,
          registrationId: params.registrationId,
          recipientPhone: params.recipientPhone,
          templateId: template.id,
          variables: {
            name: params.recipientName,
            event_title: params.eventTitle,
            event_date: params.eventDate || '',
            event_time: params.eventTime || '',
            event_location: params.eventLocation || '',
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      return false;
    }
  };

  // إشعار تغيير في فعالية
  const sendEventUpdateNotification = async (params: EventNotificationParams, updateType: 'date' | 'location' | 'canceled') => {
    try {
      let title, message;
      
      switch (updateType) {
        case 'date':
          title = `تغيير موعد فعالية ${params.eventTitle}`;
          message = `تم تغيير موعد فعالية ${params.eventTitle} إلى ${params.eventDate} الساعة ${params.eventTime}`;
          break;
        case 'location':
          title = `تغيير مكان فعالية ${params.eventTitle}`;
          message = `تم تغيير مكان فعالية ${params.eventTitle} إلى ${params.eventLocation}`;
          break;
        case 'canceled':
          title = `إلغاء فعالية ${params.eventTitle}`;
          message = `تم إلغاء فعالية ${params.eventTitle} التي كانت مقررة بتاريخ ${params.eventDate}`;
          break;
      }
      
      // إرسال إشعار داخل التطبيق
      await createNotification({
        title,
        message,
        notification_type: 'event',
        related_entity_id: params.eventId,
        related_entity_type: 'event',
        user_id: params.recipientId
      });

      return true;
    } catch (error) {
      console.error('Error sending event update notification:', error);
      return false;
    }
  };

  return {
    sendRegistrationNotification,
    sendReminderNotification,
    sendEventUpdateNotification
  };
};
