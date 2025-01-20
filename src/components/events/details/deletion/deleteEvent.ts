import { supabase } from "@/integrations/supabase/client";

export const deleteEvent = async (eventId: string) => {
  console.log('Deleting event...');
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select();
  
  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};