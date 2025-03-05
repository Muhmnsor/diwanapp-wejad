
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'event' | 'project' | 'task' | 'user' | 'comment' | 'system';
export type EntityType = 'event' | 'project' | 'task' | 'user' | 'comment';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedEntityId?: string;
  relatedEntityType?: EntityType;
}

export const createNotification = async ({
  userId,
  title,
  message,
  notificationType,
  relatedEntityId,
  relatedEntityType
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase
      .from('in_app_notifications')
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: notificationType,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
      })
      .select();

    if (error) throw error;
    
    return { success: true, notification: data?.[0] };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

export const sendBulkNotifications = async (
  userIds: string[],
  title: string,
  message: string,
  notificationType: NotificationType,
  relatedEntityId?: string,
  relatedEntityType?: EntityType
) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      notification_type: notificationType,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
    }));

    const { data, error } = await supabase
      .from('in_app_notifications')
      .insert(notifications);

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    return { success: false, error };
  }
};
