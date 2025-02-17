
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleActivityDelete = async (activityId: string) => {
  console.log("Confirming deletion for activity:", activityId);
  
  try {
    // Check if this is an event-linked activity
    const { data: activityData } = await supabase
      .from('project_activities')
      .select('event_id')
      .eq('id', activityId)
      .maybeSingle();

    const isEventActivity = activityData?.event_id !== null;
    console.log('Is event activity:', isEventActivity);

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

    // Only try to delete event feedback if this is an event activity
    if (isEventActivity) {
      console.log('Deleting event feedback records...');
      const { error: eventFeedbackError } = await supabase
        .from('event_feedback')
        .delete()
        .eq('event_id', activityData.event_id);

      if (eventFeedbackError) {
        console.error('Error deleting event feedback:', eventFeedbackError);
        throw eventFeedbackError;
      }
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

    // Only try to delete from events if it was an event activity
    if (isEventActivity) {
      console.log('Deleting from events...');
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', activityData.event_id);

      if (eventError) {
        console.error('Error deleting from events:', eventError);
        // Don't throw here as the main activity is already deleted
        console.log('Note: Event deletion failed but activity was deleted');
      }
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
