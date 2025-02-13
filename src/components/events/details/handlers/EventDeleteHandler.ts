import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteHandlerProps {
  id: string;
  onSuccess: () => void;
}

export const handleEventDelete = async ({ id, onSuccess }: DeleteHandlerProps) => {
  try {
    console.log('Starting deletion process for event:', id);

    // 1. Delete feedback first
    console.log('Deleting feedback...');
    const { error: feedbackError } = await supabase
      .from('event_feedback')
      .delete()
      .eq('event_id', id);

    if (feedbackError) {
      console.error('Error deleting feedback:', feedbackError);
      throw feedbackError;
    }
    console.log('Feedback deleted successfully');

    // 2. Delete attendance records
    console.log('Deleting attendance records...');
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .delete()
      .eq('event_id', id);

    if (attendanceError) {
      console.error('Error deleting attendance records:', attendanceError);
      throw attendanceError;
    }
    console.log('Attendance records deleted successfully');

    // 3. Delete notifications
    console.log('Deleting notifications...');
    const { error: notificationsError } = await supabase
      .from('notification_logs')
      .delete()
      .eq('event_id', id);

    if (notificationsError) {
      console.error('Error deleting notifications:', notificationsError);
      throw notificationsError;
    }
    console.log('Notifications deleted successfully');

    // 4. Delete reports
    console.log('Deleting reports...');
    const { error: reportsError } = await supabase
      .from('event_reports')
      .delete()
      .eq('event_id', id);

    if (reportsError) {
      console.error('Error deleting reports:', reportsError);
      throw reportsError;
    }
    console.log('Reports deleted successfully');

    // 5. Delete registrations
    console.log('Deleting registrations...');
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('event_id', id);

    if (registrationsError) {
      console.error('Error deleting registrations:', registrationsError);
      throw registrationsError;
    }
    console.log('Registrations deleted successfully');

    // 6. Delete notification settings
    console.log('Deleting notification settings...');
    const { error: settingsError } = await supabase
      .from('event_notification_settings')
      .delete()
      .eq('event_id', id);

    if (settingsError) {
      console.error('Error deleting notification settings:', settingsError);
      throw settingsError;
    }
    console.log('Notification settings deleted successfully');

    // 7. Delete registration fields
    console.log('Deleting registration fields...');
    const { error: fieldsError } = await supabase
      .from('event_registration_fields')
      .delete()
      .eq('event_id', id);

    if (fieldsError) {
      console.error('Error deleting registration fields:', fieldsError);
      throw fieldsError;
    }
    console.log('Registration fields deleted successfully');

    // 8. Finally delete the event itself
    console.log('Deleting event...');
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

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