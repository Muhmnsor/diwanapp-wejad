import { supabase } from "@/integrations/supabase/client";

// وظيفة إرسال إشعار واتساب
export const sendWhatsAppNotification = async (phoneNumber, message, templateName = 'correspondence_notification') => {
  try {
    // التحقق من وجود رقم هاتف صالح
    if (!phoneNumber || phoneNumber.length < 10) {
      console.error("Invalid phone number for WhatsApp notification");
      return { success: false, error: "رقم الهاتف غير صالح" };
    }
    
    // استدعاء وظيفة edge function لإرسال إشعار واتساب
    const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        to: phoneNumber,
        templateName: templateName,
        parameters: {
          message1: message,
        }
      }
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return { success: false, error };
  }
};

// وظيفة إرسال إشعار SMS
export const sendSMSNotification = async (phoneNumber, message) => {
  try {
    // التحقق من وجود رقم هاتف صالح
    if (!phoneNumber || phoneNumber.length < 10) {
      console.error("Invalid phone number for SMS notification");
      return { success: false, error: "رقم الهاتف غير صالح" };
    }
    
    // استدعاء وظيفة edge function لإرسال SMS
    const { data, error } = await supabase.functions.invoke('send-sms-notification', {
      body: {
        to: phoneNumber,
        message: message
      }
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    return { success: false, error };
  }
};

// وظيفة إرسال إشعار بريد إلكتروني
export const sendEmailNotification = async (email, subject, message) => {
  try {
    // التحقق من وجود بريد إلكتروني صالح
    if (!email || !email.includes('@')) {
      console.error("Invalid email for notification");
      return { success: false, error: "البريد الإلكتروني غير صالح" };
    }
    
    // استدعاء وظيفة edge function لإرسال البريد الإلكتروني
    const { data, error } = await supabase.functions.invoke('send-email-notification', {
      body: {
        to: email,
        subject: subject,
        message: message
      }
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email notification:", error);
    return { success: false, error };
  }
};

// وظيفة إرسال إشعار داخلي للنظام
export const sendInAppNotification = async (userId, title, message, relatedEntityId, relatedEntityType, notificationType, priority = 'normal') => {
  try {
    if (!userId) {
      console.error("User ID is required for in-app notification");
      return { success: false, error: "معرف المستخدم مطلوب" };
    }
    
    const { error } = await supabase
      .from('in_app_notifications')
      .insert({
        title,
        message,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        notification_type: notificationType,
        user_id: userId,
        priority,
        read: false
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error sending in-app notification:", error);
    return { success: false, error };
  }
};

// وظيفة شاملة لإرسال إشعارات عبر قنوات متعددة
export const sendMultiChannelNotification = async (options) => {
  const { userId, phoneNumber, email, title, message, relatedEntityId, relatedEntityType, notificationType, priority = 'normal', channels = ['in_app'] } = options;
  
  const results = {
    inApp: null,
    whatsapp: null,
    sms: null,
    email: null
  };
  
  try {
    // إرسال إشعار داخل النظام
    if (channels.includes('in_app') && userId) {
      results.inApp = await sendInAppNotification(userId, title, message, relatedEntityId, relatedEntityType, notificationType, priority);
    }
    
    // إرسال إشعار واتساب
    if (channels.includes('whatsapp') && phoneNumber) {
      results.whatsapp = await sendWhatsAppNotification(phoneNumber, message);
    }
    
    // إرسال إشعار SMS
    if (channels.includes('sms') && phoneNumber) {
      results.sms = await sendSMSNotification(phoneNumber, message);
    }
    
    // إرسال بريد إلكتروني
    if (channels.includes('email') && email) {
      results.email = await sendEmailNotification(email, title, message);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("Error sending multi-channel notification:", error);
    return { success: false, error, results };
  }
};

export default {
  sendWhatsAppNotification,
  sendSMSNotification,
  sendEmailNotification,
  sendInAppNotification,
  sendMultiChannelNotification
};

