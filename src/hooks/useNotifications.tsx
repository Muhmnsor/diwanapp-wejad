
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendNotificationParams {
  type: 'registration' | 'reminder' | 'feedback' | 'certificate' | 'activity' | 'update' | 'announcement';
  eventId?: string;
  projectId?: string;
  registrationId?: string;
  activityId?: string;
  recipientPhone: string;
  templateId: string;
  variables: Record<string, string>;
}

interface NotificationResult {
  success: boolean;
  message?: string;
  logId?: string;
}

export const useNotifications = () => {
  const [isSending, setIsSending] = useState(false);

  const sendNotification = async (params: SendNotificationParams): Promise<NotificationResult> => {
    console.log('Sending notification with params:', {
      type: params.type,
      eventId: params.eventId,
      projectId: params.projectId,
      recipientPhone: params.recipientPhone ? '****' + params.recipientPhone.slice(-4) : undefined,
      templateId: params.templateId
    });
    
    setIsSending(true);

    try {
      // Validate recipient phone number
      if (!params.recipientPhone || !params.recipientPhone.match(/^\+?[0-9]{10,15}$/)) {
        throw new Error('رقم الهاتف غير صالح');
      }
      
      // Format phone number if needed
      if (!params.recipientPhone.startsWith('+')) {
        // If number starts with 0, replace with country code
        if (params.recipientPhone.startsWith('0')) {
          params.recipientPhone = '+966' + params.recipientPhone.substring(1);
        } 
        // If number doesn't have country code, add it
        else if (!params.recipientPhone.startsWith('966')) {
          params.recipientPhone = '+966' + params.recipientPhone;
        }
        // If it starts with 966 but no +, add it
        else {
          params.recipientPhone = '+' + params.recipientPhone;
        }
      }

      // Attempt to send notification
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (error) {
        console.error('Error calling send-notification function:', error);
        throw error;
      }

      if (!data.success) {
        console.error('Notification sending failed:', data.error);
        throw new Error(data.error || 'فشل إرسال الإشعار');
      }

      console.log('Notification sent successfully:', data);
      return {
        success: true,
        logId: data.logId,
        message: 'تم إرسال الإشعار بنجاح'
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الإشعار';
      
      // Don't show toast if called programmatically - let the caller decide
      // Whether to show a toast or handle the error differently
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsSending(false);
    }
  };
  
  const resendNotification = async (logId: string): Promise<NotificationResult> => {
    setIsSending(true);
    
    try {
      console.log('Resending notification with log ID:', logId);
      
      const { data, error } = await supabase.functions.invoke('resend-notification', {
        body: { logId }
      });
      
      if (error) {
        console.error('Error calling resend-notification function:', error);
        throw error;
      }
      
      console.log('Notification resent successfully:', data);
      toast.success('تم إعادة إرسال الإشعار بنجاح');
      
      return {
        success: true,
        logId: data.logId,
        message: 'تم إعادة إرسال الإشعار بنجاح'
      };
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إعادة إرسال الإشعار');
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إعادة إرسال الإشعار'
      };
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendNotification,
    resendNotification,
    isSending
  };
};
