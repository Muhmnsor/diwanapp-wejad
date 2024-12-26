import { supabase } from "@/integrations/supabase/client";

export const deleteNotifications = async (eventId: string) => {
  console.log('Deleting notification logs...');
  const { error: notificationError } = await supabase
    .from('notification_logs')
    .delete()
    .eq('event_id', eventId);
  
  if (notificationError) {
    console.error('Error deleting notifications:', notificationError);
    throw notificationError;
  }

  console.log('Deleting notification settings...');
  const { error: settingsError } = await supabase
    .from('event_notification_settings')
    .delete()
    .eq('event_id', eventId);
  
  if (settingsError) {
    console.error('Error deleting notification settings:', settingsError);
    throw settingsError;
  }
};