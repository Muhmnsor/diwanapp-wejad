
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
      console.log('No user ID provided for notification');
      return null;
    }

    const targetUserId = params.user_id || user?.id;
    
    try {
      setIsCreating(true);
      
      const { data, error } = await supabase
        .from('in_app_notifications')
        .insert({
          user_id: targetUserId,
          title: params.title,
          message: params.message,
          notification_type: params.notification_type,
          related_entity_id: params.related_entity_id,
          related_entity_type: params.related_entity_type,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('in_app_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
      
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
