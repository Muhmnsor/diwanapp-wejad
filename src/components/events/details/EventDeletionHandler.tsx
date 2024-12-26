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
    const { data: feedbackData, error: feedbackCheckError } = await supabase
      .from('event_feedback')
      .select('id')
      .eq('event_id', eventId);

    if (feedbackCheckError) {
      console.error('Error checking feedback:', feedbackCheckError);
      throw feedbackCheckError;
    }

    if (feedbackData && feedbackData.length > 0) {
      console.log(`Found ${feedbackData.length} feedback records to delete`);
      const { error: deleteError } = await supabase
        .from('event_feedback')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('Error deleting feedback:', deleteError);
        throw deleteError;
      }
      console.log('Feedback deleted successfully');
    }

    // 2. Delete attendance records
    const { data: attendanceData } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('event_id', eventId);

    if (attendanceData && attendanceData.length > 0) {
      await deleteAttendance(eventId);
      console.log('Attendance records deleted successfully');
    }

    // 3. Delete notifications
    const { data: notificationsData } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('event_id', eventId);

    if (notificationsData && notificationsData.length > 0) {
      await deleteNotifications(eventId);
      console.log('Notifications deleted successfully');
    }

    // 4. Delete reports
    const { data: reportsData } = await supabase
      .from('event_reports')
      .select('id')
      .eq('event_id', eventId);

    if (reportsData && reportsData.length > 0) {
      await deleteReports(eventId);
      console.log('Reports deleted successfully');
    }

    // 5. Delete registrations
    const { data: registrationsData } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId);

    if (registrationsData && registrationsData.length > 0) {
      await deleteRegistrations(eventId);
      console.log('Registrations deleted successfully');
    }

    // 6. Finally delete the event itself
    const { error: eventDeleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (eventDeleteError) {
      console.error('Error deleting event:', eventDeleteError);
      throw eventDeleteError;
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