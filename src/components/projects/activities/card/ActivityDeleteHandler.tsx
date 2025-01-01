import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleActivityDelete = async (activityId: string) => {
  console.log("Confirming deletion for activity:", activityId);
  
  try {
    // First delete feedback records
    console.log('Deleting feedback records...');
    const { error: feedbackError } = await supabase
      .from('event_feedback')
      .delete()
      .eq('event_id', activityId);

    if (feedbackError) {
      console.error('Error deleting feedback:', feedbackError);
      throw feedbackError;
    }

    // Delete attendance records
    console.log('Deleting attendance records...');
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('activity_id', activityId);

    if (attendanceError) {
      console.error('Error deleting attendance records:', attendanceError);
      throw attendanceError;
    }

    // Delete activity reports
    console.log('Deleting activity reports...');
    const { error: reportsError } = await supabase
      .from('project_activity_reports')
      .delete()
      .eq('activity_id', activityId);

    if (reportsError) {
      console.error('Error deleting activity reports:', reportsError);
      throw reportsError;
    }

    // Finally delete the activity
    console.log('Deleting activity...');
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', activityId)
      .eq('is_project_activity', true);

    if (deleteError) {
      console.error('Error deleting activity:', deleteError);
      throw deleteError;
    }

    console.log('Activity deleted successfully');
    toast.success('تم حذف النشاط بنجاح');
    return true;
  } catch (error) {
    console.error("Error in delete process:", error);
    toast.error('حدث خطأ أثناء حذف النشاط');
    return false;
  }
};