
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { NotificationType } from "@/contexts/notifications/types";

interface QueuedNotification {
  user_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  related_entity_id?: string;
  related_entity_type?: string;
  priority?: number;
}

export const useNotificationQueue = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();
  
  // Add a notification to the queue
  const queueNotification = async (notification: QueuedNotification) => {
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .insert([
          {
            ...notification,
            status: 'pending',
            created_by: user?.id
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error queueing notification:', error);
      return null;
    }
  };

  // Process a batch of notifications (for internal use)
  const processBatch = async (batchSize = 5) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Get pending notifications
      const { data: queuedNotifications, error: fetchError } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(batchSize);

      if (fetchError) throw fetchError;
      
      if (!queuedNotifications || queuedNotifications.length === 0) {
        return;
      }

      // Group notifications by user to avoid overwhelming them
      const userNotifications: Record<string, QueuedNotification[]> = {};
      
      queuedNotifications.forEach(notification => {
        if (!userNotifications[notification.user_id]) {
          userNotifications[notification.user_id] = [];
        }
        userNotifications[notification.user_id].push(notification);
      });

      // Process notifications for each user
      for (const userId in userNotifications) {
        const notifications = userNotifications[userId];
        
        // Insert notifications into the in_app_notifications table
        const { error: insertError } = await supabase
          .from('in_app_notifications')
          .insert(
            notifications.map(n => ({
              user_id: n.user_id,
              title: n.title,
              message: n.message,
              notification_type: n.notification_type,
              related_entity_id: n.related_entity_id,
              related_entity_type: n.related_entity_type,
              read: false
            }))
          );

        if (insertError) throw insertError;
        
        // Update notification queue status
        await supabase
          .from('notification_queue')
          .update({ status: 'processed' })
          .in('id', notifications.map(n => n.id));
      }
    } catch (error) {
      console.error('Error processing notification batch:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Queue multiple notifications for different users
  const queueMultipleNotifications = async (notifications: QueuedNotification[]) => {
    if (!notifications.length) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_queue')
        .insert(
          notifications.map(n => ({
            ...n,
            status: 'pending',
            created_by: user?.id
          }))
        );

      if (error) throw error;
      
      // Start processing the queue
      processBatch();
      
      return data;
    } catch (error) {
      console.error('Error queueing multiple notifications:', error);
      return null;
    }
  };

  return {
    queueNotification,
    queueMultipleNotifications,
    processBatch
  };
};
