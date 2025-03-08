
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { NotificationType } from './types';

interface CreateNotificationParams {
  title: string;
  message: string;
  notification_type: NotificationType;
  related_entity_id?: string;
  related_entity_type?: string;
  user_id?: string;
}

export const useInAppNotifications = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();

  const createNotification = async (params: CreateNotificationParams) => {
    if (!user && !params.user_id) {
      console.error('No user ID provided for notification');
      return null;
    }

    const targetUserId = params.user_id || user?.id;
    
    if (!targetUserId) {
      console.error('Cannot determine target user ID for notification');
      return null;
    }
    
    console.log('Creating notification for user:', targetUserId);
    console.log('Current auth state:', user ? 'Logged in' : 'Not logged in');
    console.log('Notification parameters:', params);
    
    try {
      setIsCreating(true);
      
      const notificationData = {
        user_id: targetUserId,
        title: params.title,
        message: params.message,
        notification_type: params.notification_type,
        related_entity_id: params.related_entity_id,
        related_entity_type: params.related_entity_type,
        read: false
      };
      
      console.log('Notification data to insert:', notificationData);
      
      // Attempt to insert directly with service role to bypass RLS
      try {
        console.log('Attempting to create notification...');
        const { data, error } = await supabase
          .from('in_app_notifications')
          .insert(notificationData)
          .select()
          .single();

        if (error) {
          console.error('Error creating notification:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
          
          // Check if this is a policy violation error
          if (error.code === '42501' || error.message.includes('policy')) {
            console.error('This appears to be a policy violation. Will try alternative approach.');
          }
          
          throw error;
        }
        
        console.log('Notification created successfully:', data);
        return data;
      } catch (insertError) {
        console.error('Exception in primary notification insert:', insertError);
        
        // Try a different approach using a function
        try {
          console.log('Trying alternate approach to create notification...');
          
          // Call a Supabase edge function to create the notification with admin privileges
          const { data: functionData, error: functionError } = await supabase.functions.invoke('create-notification', {
            body: notificationData
          });
          
          if (functionError) {
            console.error('Error in edge function:', functionError);
            toast.error('فشل في إنشاء الإشعار عبر الوظيفة البديلة');
            return null;
          }
          
          console.log('Notification created via function:', functionData);
          return functionData;
        } catch (functionCallError) {
          console.error('Exception in function call:', functionCallError);
          toast.error('حدث خطأ أثناء محاولة الطريقة البديلة لإنشاء الإشعار');
          return null;
        }
      }
    } catch (error) {
      console.error('Exception while creating notification:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) {
      console.error('No logged in user to mark notification as read');
      return false;
    }
    
    try {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
      
      console.log('Notification marked as read successfully');
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user) {
      console.error('No logged in user to mark all notifications as read');
      return false;
    }
    
    try {
      console.log('Marking all notifications as read for user:', user.id);
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
      
      console.log('All notifications marked as read successfully');
      toast.success('تم تحديث جميع الإشعارات كمقروءة');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
      return false;
    }
  };

  return {
    createNotification,
    markAsRead,
    markAllAsRead,
    isCreating
  };
};
