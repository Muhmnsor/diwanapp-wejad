import { supabase } from "@/integrations/supabase/client";

export const deleteNotifications = async (eventId: string) => {
  console.log('Deleting notification records...');
  
  // First delete notification logs
  const { error: logsError } = await supabase
    .from('notification_logs')
    .delete()
    .eq('event_id', eventId)
    .select();
  
  if (logsError) {
    console.error('Error deleting notification logs:', logsError);
    throw logsError;
  }

  // Then delete notification settings
  const { error: settingsError } = await supabase
    .from('event_notification_settings')
    .delete()
    .eq('event_id', eventId)
    .select();
  
  if (settingsError) {
    console.error('Error deleting notification settings:', settingsError);
    throw settingsError;
  }
};