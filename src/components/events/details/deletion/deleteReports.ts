import { supabase } from "@/integrations/supabase/client";

export const deleteReports = async (eventId: string) => {
  console.log('Deleting event reports...');
  const { error } = await supabase
    .from('event_reports')
    .delete()
    .eq('event_id', eventId)
    .select();
  
  if (error) {
    console.error('Error deleting reports:', error);
    throw error;
  }
};