import { deleteFeedback } from "./deletion/deleteFeedback";
import { deleteAttendance } from "./deletion/deleteAttendance";
import { deleteNotifications } from "./deletion/deleteNotifications";
import { deleteReports } from "./deletion/deleteReports";
import { deleteRegistrations } from "./deletion/deleteRegistrations";
import { deleteEvent } from "./deletion/deleteEvent";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventDeletionHandlerProps {
  eventId: string;
  onSuccess: () => void;
}

export const handleEventDeletion = async ({ eventId, onSuccess }: EventDeletionHandlerProps) => {
  try {
    console.log('Starting deletion process for event:', eventId);

    // 1. Delete feedback first
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('event_feedback')
      .delete()
      .eq('event_id', eventId)
      .select();

    if (feedbackError) {
      console.error('Error deleting feedback:', feedbackError);
      throw feedbackError;
    }
    console.log('Feedback deleted:', feedbackData);

    // 2. Delete attendance records
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('event_id', eventId);

    if (attendanceError) {
      console.error('Error deleting attendance records:', attendanceError);
      throw attendanceError;
    }
    console.log('Attendance records deleted successfully');

    // 3. Delete notifications
    const { error: notificationsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('event_id', eventId);

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError);
      throw notificationsError;
    }
    console.log('Notifications deleted successfully');

    // 4. Delete reports
    const { error: reportsError } = await supabase
      .from('event_reports')
      .delete()
      .eq('event_id', eventId);

    if (reportsError) {
      console.error('Error deleting reports:', reportsError);
      throw reportsError;
    }
    console.log('Reports deleted successfully');

    // 5. Delete registrations
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', eventId);

    if (registrationsError) {
      console.error('Error deleting registrations:', registrationsError);
      throw registrationsError;
    }
    console.log('Registrations deleted successfully');

    // 6. Finally delete the event itself
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (eventError) {
      console.error('Error deleting event:', eventError);
      throw eventError;
    }

    console.log('Event deleted successfully');
    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};