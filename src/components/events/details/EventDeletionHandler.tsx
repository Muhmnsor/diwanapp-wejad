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

    // First check if there's any feedback for this event
    const { data: feedbackData } = await supabase
      .from('event_feedback')
      .select('id')
      .eq('event_id', eventId);

    if (feedbackData && feedbackData.length > 0) {
      await deleteFeedback(eventId);
      console.log('Feedback deleted successfully');
    }

    // Check and delete attendance records
    const { data: attendanceData } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('event_id', eventId);

    if (attendanceData && attendanceData.length > 0) {
      await deleteAttendance(eventId);
      console.log('Attendance records deleted successfully');
    }

    // Check and delete notifications
    const { data: notificationsData } = await supabase
      .from('notification_logs')
      .select('id')
      .eq('event_id', eventId);

    if (notificationsData && notificationsData.length > 0) {
      await deleteNotifications(eventId);
      console.log('Notifications deleted successfully');
    }

    // Check and delete reports
    const { data: reportsData } = await supabase
      .from('event_reports')
      .select('id')
      .eq('event_id', eventId);

    if (reportsData && reportsData.length > 0) {
      await deleteReports(eventId);
      console.log('Reports deleted successfully');
    }

    // Check and delete registrations
    const { data: registrationsData } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId);

    if (registrationsData && registrationsData.length > 0) {
      await deleteRegistrations(eventId);
      console.log('Registrations deleted successfully');
    }

    // Finally delete the event itself
    await deleteEvent(eventId);
    console.log('Event deleted successfully');

    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};