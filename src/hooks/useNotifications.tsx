import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendNotificationParams {
  type: 'registration' | 'reminder' | 'feedback' | 'certificate' | 'activity';
  eventId?: string;
  projectId?: string;
  registrationId?: string;
  activityId?: string;
  recipientPhone: string;
  templateId: string;
  variables: Record<string, string>;
}

export const useNotifications = () => {
  const [isSending, setIsSending] = useState(false);

  const sendNotification = async (params: SendNotificationParams) => {
    console.log('Sending notification with params:', params);
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (error) throw error;

      console.log('Notification sent successfully:', data);
      toast.success('تم إرسال الإشعار بنجاح');
      return data;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('حدث خطأ أثناء إرسال الإشعار');
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendNotification,
    isSending
  };
};