import { supabase } from "@/integrations/supabase/client";

export const deleteEvent = async (eventId: string) => {
  console.log('Deleting event...');
  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select()
    .single();
  
  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return data;
};