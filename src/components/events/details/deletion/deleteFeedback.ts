import { supabase } from "@/integrations/supabase/client";

export const deleteFeedback = async (eventId: string) => {
  console.log('Deleting event feedback records...');
  const { error } = await supabase
    .from('event_feedback')
    .delete()
    .eq('event_id', eventId)
    .select();
  
  if (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
};