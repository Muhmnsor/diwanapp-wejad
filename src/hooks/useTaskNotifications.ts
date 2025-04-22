
import { useInAppNotifications } from '@/contexts/notifications/useInAppNotifications';
import { supabase } from '@/integrations/supabase/client';

interface TaskNotificationParams {
  taskId: string;
  taskTitle: string;
  projectId?: string;
  projectTitle?: string;
  assignedUserId: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

export const useTaskNotifications = () => {
  const { createNotification } = useInAppNotifications();

  // إشعار تغيير حالة المهمة
  const sendTaskStatusUpdateNotification = async (params: TaskNotificationParams, newStatus: string) => {
    try {
      if (!params.assignedUserId) {
        console.log('No assigned user ID provided for notification');
        return null;
      }
      
      // ترجمة حالة المهمة
      const statusTranslation: Record<string, string> = {
        'pending': 'بانتظار البدء',
        'in_progress': 'قيد التنفيذ',
        'completed': 'مكتملة',
        'late': 'متأخرة',
        'canceled': 'ملغية'
      };
      
      const statusText = statusTranslation[newStatus] || newStatus;
      
      let message = `تم تحديث حالة المهمة "${params.taskTitle}" إلى ${statusText}`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      console.log('Sending task status notification to:', params.assignedUserId, 'message:', message);
      
      try {
        // محاولة إنشاء الإشعار باستخدام createNotification
        const result = await createNotification({
          title: `تحديث حالة المهمة`,
          message,
          notification_type: 'task',
          related_entity_id: params.taskId,
          related_entity_type: params.projectId ? 'project_task' : 'task',
          user_id: params.assignedUserId
        });
        
        console.log('Status notification result:', result ? 'Success' : 'Failed');
        
        // إذا فشلت، نستخدم Edge Function
        if (!result) {
          console.log('Using edge function as fallback for status notification...');
          
          const notificationData = {
            user_id: params.assignedUserId,
            title: `تحديث حالة المهمة`,
            message,
            notification_type: 'task',
            related_entity_id: params.taskId,
            related_entity_type: params.projectId ? 'project_task' : 'task',
            read: false
          };
          
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-notification', {
            body: {
              type: 'notification',
              notification: notificationData
            }
          });
          
          if (functionError) {
            console.error('Error in edge function:', functionError);
            return null;
          }
          
          console.log('Status notification created via function:', functionData);
          return functionData;
        }
        
        return result;
      } catch (notificationError) {
        console.error('Error in createNotification:', notificationError);
        return null;
      }
    } catch (error) {
      console.error('Error sending task status update notification:', error);
      return null;
    }
  };

  // إشعار إضافة تعليق على المهمة
  const sendTaskCommentNotification = async (params: TaskNotificationParams) => {
    try {
      if (!params.assignedUserId) {
        console.error('No assigned user ID provided for notification');
        return null;
      }
      
      console.log('Sending comment notification to assignee:', params.assignedUserId);
      
      let message = `تمت إضافة تعليق جديد على المهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      message += `. تم تغيير حالة المهمة إلى قيد التنفيذ.`;
      
      console.log('Notification message content:', message);
      
      try {
        // محاولة إنشاء الإشعار باستخدام createNotification
        const result = await createNotification({
          title: `تعليق جديد على المهمة`,
          message,
          notification_type: 'comment',
          related_entity_id: params.taskId,
          related_entity_type: params.projectId ? 'project_task' : 'task',
          user_id: params.assignedUserId
        });
        
        console.log('Comment notification creation result:', result ? 'Success' : 'Failed');
        
        // إذا فشلت، نستخدم Edge Function
        if (!result) {
          console.log('Using edge function as fallback for comment notification...');
          
          const notificationData = {
            user_id: params.assignedUserId,
            title: `تعليق جديد على المهمة`,
            message,
            notification_type: 'comment',
            related_entity_id: params.taskId,
            related_entity_type: params.projectId ? 'project_task' : 'task',
            read: false
          };
          
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-notification', {
            body: {
              type: 'notification',
              notification: notificationData
            }
          });
          
          if (functionError) {
            console.error('Error in edge function:', functionError);
            return null;
          }
          
          console.log('Comment notification created via function:', functionData);
          return functionData;
        }
        
        return result;
      } catch (notificationError) {
        console.error('Error in notification creation:', notificationError);
        return null;
      }
    } catch (error) {
      console.error('Error sending task comment notification:', error, 'Params:', JSON.stringify(params));
      return null;
    }
  };
  
  // إشعار إضافة مرفق للمهمة
  const sendTaskAttachmentNotification = async (params: TaskNotificationParams) => {
    try {
      if (!params.assignedUserId) {
        console.log('No assigned user ID provided for attachment notification');
        return null;
      }
      
      let message = `تمت إضافة مرفق جديد للمهمة "${params.taskTitle}"`;
      if (params.projectTitle) {
        message += ` في مشروع "${params.projectTitle}"`;
      }
      if (params.updatedByUserName) {
        message += ` بواسطة ${params.updatedByUserName}`;
      }
      
      try {
        // محاولة إنشاء الإشعار باستخدام createNotification
        const result = await createNotification({
          title: `مرفق جديد للمهمة`,
          message,
          notification_type: 'task',
          related_entity_id: params.taskId,
          related_entity_type: params.projectId ? 'project_task' : 'task',
          user_id: params.assignedUserId
        });
        
        console.log('Attachment notification result:', result ? 'Success' : 'Failed');
        
        // إذا فشلت، نستخدم Edge Function
        if (!result) {
          console.log('Using edge function as fallback for attachment notification...');
          
          const notificationData = {
            user_id: params.assignedUserId,
            title: `مرفق جديد للمهمة`,
            message,
            notification_type: 'task',
            related_entity_id: params.taskId,
            related_entity_type: params.projectId ? 'project_task' : 'task',
            read: false
          };
          
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-notification', {
            body: {
              type: 'notification',
              notification: notificationData
            }
          });
          
          if (functionError) {
            console.error('Error in edge function:', functionError);
            return null;
          }
          
          console.log('Attachment notification created via function:', functionData);
          return functionData;
        }
        
        return result;
      } catch (notificationError) {
        console.error('Error in attachment notification creation:', notificationError);
        return null;
      }
    } catch (error) {
      console.error('Error sending task attachment notification:', error);
      return null;
    }
  };

  return {
    sendTaskStatusUpdateNotification,
    sendTaskCommentNotification,
    sendTaskAttachmentNotification
  };
};
