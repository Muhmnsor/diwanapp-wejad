import { supabase } from "@/integrations/supabase/client";

export const deleteRegistrations = async (eventId: string) => {
  console.log('Deleting event registrations...');
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('event_id', eventId);
  
  if (error) {
    console.error('Error deleting registrations:', error);
    throw error;
  }
};