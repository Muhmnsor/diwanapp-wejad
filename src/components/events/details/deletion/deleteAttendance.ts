import { supabase } from "@/integrations/supabase/client";

export const deleteAttendance = async (eventId: string) => {
  console.log('Deleting attendance records...');
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('event_id', eventId)
    .select();
  
  if (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};