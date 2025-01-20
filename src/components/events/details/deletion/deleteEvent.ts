import { supabase } from "@/integrations/supabase/client";

export const deleteEvent = async (eventId: string) => {
  console.log('Deleting event and related data...');
  
  try {
    // First, delete related events
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .eq('project_id', eventId);

    if (eventsError) {
      console.error('Error deleting related events:', eventsError);
      throw eventsError;
    }

    // Then, delete related registrations
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('project_id', eventId);

    if (registrationsError) {
      console.error('Error deleting registrations:', registrationsError);
      throw registrationsError;
    }

    // Finally, delete the project itself
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', eventId)
      .select();
  
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    console.log('Successfully deleted project and related data');
  } catch (error) {
    console.error('Error in delete operation:', error);
    throw error;
  }
};