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
    await deleteFeedback(eventId);
    console.log('Feedback deleted');
    
    await deleteAttendance(eventId);
    console.log('Attendance deleted');
    
    await deleteNotifications(eventId);
    console.log('Notifications deleted');
    
    await deleteReports(eventId);
    console.log('Reports deleted');
    
    await deleteRegistrations(eventId);
    console.log('Registrations deleted');
    
    // Finally delete the event itself
    await deleteEvent(eventId);
    console.log('Event deleted');

    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};