
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';

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
      console.log('Sending registration notification:', {
        eventTitle: params.eventTitle,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone ? '****' + params.recipientPhone.slice(-4) : undefined
      });
      
      // 1. إرسال إشعار داخل التطبيق
      if (params.recipientId) {
        await createNotification({
          title: `تم التسجيل في فعالية ${params.eventTitle}`,
          message: `تم تسجيلك بنجاح في فعالية ${params.eventTitle}${params.eventDate ? ` بتاريخ ${params.eventDate}` : ''}`,
          notification_type: 'event',
          related_entity_id: params.eventId,
          related_entity_type: 'event',
          user_id: params.recipientId
        });
      }

      // 2. إرسال إشعار واتساب (إذا توفر قالب)
      const { data: template, error: templateError } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .maybeSingle();

      if (templateError) {
        console.error('Error fetching template:', templateError);
        throw new Error('فشل في الحصول على قالب الإشعار');
      }

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
        console.log('WhatsApp notification sent successfully');
      } else {
        console.warn('No default template found for event registration');
      }

      return true;
    } catch (error) {
      console.error('Error sending registration notification:', error);
      // Re-throw to allow the caller to handle or log the error
      throw error;
    }
  };

  // إشعار تذكير بفعالية
  const sendReminderNotification = async (params: EventNotificationParams) => {
    try {
      console.log('Sending reminder notification:', {
        eventTitle: params.eventTitle,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone ? '****' + params.recipientPhone.slice(-4) : undefined
      });
      
      // 1. إرسال إشعار داخل التطبيق
      if (params.recipientId) {
        await createNotification({
          title: `تذكير بفعالية ${params.eventTitle}`,
          message: `تذكير: فعالية ${params.eventTitle} ستقام ${params.eventDate ? `بتاريخ ${params.eventDate}` : 'غداً'} ${params.eventTime ? `الساعة ${params.eventTime}` : ''} ${params.eventLocation ? `في ${params.eventLocation}` : ''}`,
          notification_type: 'event',
          related_entity_id: params.eventId,
          related_entity_type: 'event',
          user_id: params.recipientId
        });
      }

      // 2. إرسال إشعار واتساب (إذا توفر قالب)
      const { data: template, error: templateError } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_reminder')
        .eq('is_default', true)
        .maybeSingle();

      if (templateError) {
        console.error('Error fetching template:', templateError);
        throw new Error('فشل في الحصول على قالب الإشعار');
      }

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
        console.log('WhatsApp reminder sent successfully');
      } else {
        console.warn('No default template found for event reminder');
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
      console.log('Sending event update notification:', {
        eventTitle: params.eventTitle,
        updateType,
        recipientName: params.recipientName,
        recipientPhone: params.recipientPhone ? '****' + params.recipientPhone.slice(-4) : undefined
      });
      
      let title, message;
      let notificationType = `event_${updateType}`;
      
      switch (updateType) {
        case 'date':
          title = `تغيير موعد فعالية ${params.eventTitle}`;
          message = `تم تغيير موعد فعالية ${params.eventTitle} إلى ${params.eventDate} ${params.eventTime ? `الساعة ${params.eventTime}` : ''}`;
          break;
        case 'location':
          title = `تغيير مكان فعالية ${params.eventTitle}`;
          message = `تم تغيير مكان فعالية ${params.eventTitle} إلى ${params.eventLocation}`;
          break;
        case 'canceled':
          title = `إلغاء فعالية ${params.eventTitle}`;
          message = `تم إلغاء فعالية ${params.eventTitle} التي كانت مقررة ${params.eventDate ? `بتاريخ ${params.eventDate}` : ''}`;
          break;
      }
      
      // إرسال إشعار داخل التطبيق
      if (params.recipientId) {
        await createNotification({
          title,
          message,
          notification_type: 'event',
          related_entity_id: params.eventId,
          related_entity_type: 'event',
          user_id: params.recipientId
        });
      }

      // إرسال إشعار واتساب (إذا توفر قالب)
      const { data: template, error: templateError } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', notificationType)
        .eq('is_default', true)
        .maybeSingle();

      if (templateError) {
        console.error('Error fetching template:', templateError);
      } else if (template) {
        await sendNotification({
          type: 'update',
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
            update_type: updateType === 'date' ? 'موعد' : updateType === 'location' ? 'مكان' : 'إلغاء'
          }
        });
        console.log('WhatsApp update notification sent successfully');
      } else {
        console.warn(`No default template found for event ${updateType}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending event update notification:', error);
      return false;
    }
  };

  // إشعار للمشاركين في الفعالية (للإرسال الجماعي)
  const sendBulkEventNotification = async (eventId: string, message: string, templateId: string) => {
    try {
      console.log('Sending bulk notification to event participants:', { eventId });
      
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, date, time, location')
        .eq('id', eventId)
        .single();
        
      if (eventError) {
        console.error('Error fetching event:', eventError);
        throw new Error('فشل في الحصول على بيانات الفعالية');
      }
      
      // Get all registrations for this event
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select('id, arabic_name, phone, user_id')
        .eq('event_id', eventId);
        
      if (registrationsError) {
        console.error('Error fetching registrations:', registrationsError);
        throw new Error('فشل في الحصول على قائمة المسجلين');
      }
      
      if (!registrations || registrations.length === 0) {
        console.warn('No registrations found for this event');
        return { success: false, message: 'لا يوجد مسجلين في هذه الفعالية' };
      }
      
      // Send notifications to each participant
      const results = await Promise.allSettled(
        registrations.map(async (registration) => {
          // Send in-app notification if user_id exists
          if (registration.user_id) {
            await createNotification({
              title: `إشعار بخصوص فعالية ${event.title}`,
              message,
              notification_type: 'event',
              related_entity_id: eventId,
              related_entity_type: 'event',
              user_id: registration.user_id
            });
          }
          
          // Send WhatsApp notification
          if (registration.phone) {
            await sendNotification({
              type: 'announcement',
              eventId,
              registrationId: registration.id,
              recipientPhone: registration.phone,
              templateId,
              variables: {
                name: registration.arabic_name,
                event_title: event.title,
                event_date: event.date || '',
                event_time: event.time || '',
                event_location: event.location || '',
                message
              }
            });
          }
          
          return registration.id;
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: true,
        message: `تم إرسال ${successful} إشعار بنجاح${failed > 0 ? ` (فشل إرسال ${failed} إشعار)` : ''}`
      };
    } catch (error) {
      console.error('Error sending bulk event notification:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الإشعارات'
      };
    }
  };

  return {
    sendRegistrationNotification,
    sendReminderNotification,
    sendEventUpdateNotification,
    sendBulkEventNotification
  };
};
