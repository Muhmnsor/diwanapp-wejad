import { deleteFeedback } from "./deletion/deleteFeedback";
import { deleteAttendance } from "./deletion/deleteAttendance";
import { deleteNotifications } from "./deletion/deleteNotifications";
import { deleteReports } from "./deletion/deleteReports";
import { deleteRegistrations } from "./deletion/deleteRegistrations";
import { deleteEvent } from "./deletion/deleteEvent";
import { toast } from "sonner";

interface EventDeletionHandlerProps {
  eventId: string;
  onSuccess: () => void;
}

export const handleEventDeletion = async ({ eventId, onSuccess }: EventDeletionHandlerProps) => {
  try {
    console.log('Starting deletion process for event:', eventId);
    
    // Delete related records in order
    const feedbackResult = await deleteFeedback(eventId);
    console.log('Feedback deleted:', feedbackResult);
    
    const attendanceResult = await deleteAttendance(eventId);
    console.log('Attendance deleted:', attendanceResult);
    
    const notificationsResult = await deleteNotifications(eventId);
    console.log('Notifications deleted:', notificationsResult);
    
    const reportsResult = await deleteReports(eventId);
    console.log('Reports deleted:', reportsResult);
    
    const registrationsResult = await deleteRegistrations(eventId);
    console.log('Registrations deleted:', registrationsResult);
    
    // Finally delete the event itself
    const eventResult = await deleteEvent(eventId);
    console.log('Event deleted:', eventResult);

    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};