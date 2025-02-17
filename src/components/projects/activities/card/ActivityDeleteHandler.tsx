
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleActivityDelete = async (activityId: string) => {
  console.log("Confirming deletion for activity:", activityId);
  
  try {
    // First delete both types of feedback records
    console.log('Deleting activity feedback records...');
    const { error: activityFeedbackError } = await supabase
      .from('activity_feedback')
      .delete()
      .eq('project_activity_id', activityId);

    if (activityFeedbackError) {
      console.error('Error deleting activity feedback:', activityFeedbackError);
      throw activityFeedbackError;
    }

    console.log('Deleting event feedback records...');
    const { error: eventFeedbackError } = await supabase
      .from('event_feedback')
      .delete()
      .eq('event_id', activityId);

    if (eventFeedbackError) {
      console.error('Error deleting event feedback:', eventFeedbackError);
      throw eventFeedbackError;
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

    // Delete from project_activities first
    console.log('Deleting from project_activities...');
    const { error: projectActivityError } = await supabase
      .from('project_activities')
      .delete()
      .eq('id', activityId);

    if (projectActivityError) {
      console.error('Error deleting from project_activities:', projectActivityError);
      throw projectActivityError;
    }

    // Finally try to delete from events if it exists there
    console.log('Deleting from events...');
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', activityId);

    // We don't throw on event error since not all activities are events
    if (eventError) {
      console.log('Note: Activity was not found in events table or already deleted');
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
