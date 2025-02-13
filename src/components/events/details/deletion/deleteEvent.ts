import { supabase } from "@/integrations/supabase/client";

export const deleteEvent = async (eventId: string) => {
  try {
    console.log('Starting project deletion process for:', eventId);

    // 1. First delete project registration fields
    console.log('Deleting project registration fields...');
    const { error: fieldsError } = await supabase
      .from('project_registration_fields')
      .delete()
      .eq('project_id', eventId);
    
    if (fieldsError) {
      console.error('Error deleting registration fields:', fieldsError);
      throw fieldsError;
    }

    // 2. Delete attendance records
    console.log('Deleting attendance records...');
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('project_id', eventId);

    if (attendanceError) {
      console.error('Error deleting attendance records:', attendanceError);
      throw attendanceError;
    }

    // 3. Delete project activities (events)
    console.log('Deleting project activities...');
    const { error: activitiesError } = await supabase
      .from('events')
      .delete()
      .eq('project_id', eventId);

    if (activitiesError) {
      console.error('Error deleting activities:', activitiesError);
      throw activitiesError;
    }

    // 4. Delete registrations
    console.log('Deleting registrations...');
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('project_id', eventId);

    if (registrationsError) {
      console.error('Error deleting registrations:', registrationsError);
      throw registrationsError;
    }

    // 5. Finally delete the project
    console.log('Deleting project...');
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', eventId);

    if (projectError) {
      console.error('Error deleting project:', projectError);
      throw projectError;
    }

    console.log('Project deletion completed successfully');
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};