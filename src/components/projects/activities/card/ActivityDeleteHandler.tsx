
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleActivityDelete = async (activityId: string) => {
  console.log("Confirming deletion for activity:", activityId);
  
  try {
    // First check if activity exists
    const { data: activityData, error: activityCheckError } = await supabase
      .from('project_activities')
      .select('*')
      .eq('id', activityId)
      .maybeSingle();

    if (activityCheckError) {
      console.error('Error checking activity:', activityCheckError);
      throw activityCheckError;
    }

    if (!activityData) {
      console.error('Activity not found:', activityId);
      throw new Error('Activity not found');
    }

    // First delete feedback records
    console.log('Deleting activity feedback records...');
    const { error: activityFeedbackError } = await supabase
      .from('activity_feedback')
      .delete()
      .eq('project_activity_id', activityId);

    if (activityFeedbackError) {
      console.error('Error deleting activity feedback:', activityFeedbackError);
      throw activityFeedbackError;
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

    // Delete from project_activities
    console.log('Deleting from project_activities...');
    const { error: projectActivityError } = await supabase
      .from('project_activities')
      .delete()
      .eq('id', activityId);

    if (projectActivityError) {
      console.error('Error deleting from project_activities:', projectActivityError);
      throw projectActivityError;
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
