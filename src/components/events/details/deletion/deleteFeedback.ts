import { supabase } from "@/integrations/supabase/client";

export const deleteFeedback = async (eventId: string) => {
  console.log('Deleting event feedback records for event:', eventId);
  
  try {
    // First, get all feedback records for this event
    const { data: feedbackRecords, error: fetchError } = await supabase
      .from('event_feedback')
      .select('id')
      .eq('event_id', eventId);
    
    if (fetchError) {
      console.error('Error fetching feedback records:', fetchError);
      throw fetchError;
    }

    if (!feedbackRecords || feedbackRecords.length === 0) {
      console.log('No feedback records found for event:', eventId);
      return;
    }

    console.log(`Found ${feedbackRecords.length} feedback records to delete`);

    // Delete feedback records one by one to ensure all are deleted
    for (const record of feedbackRecords) {
      const { error: deleteError } = await supabase
        .from('event_feedback')
        .delete()
        .eq('id', record.id);
      
      if (deleteError) {
        console.error('Error deleting feedback record:', deleteError);
        throw deleteError;
      }
    }
    
    console.log('Successfully deleted all feedback records for event:', eventId);
  } catch (error) {
    console.error('Error in deleteFeedback:', error);
    throw error;
  }
};