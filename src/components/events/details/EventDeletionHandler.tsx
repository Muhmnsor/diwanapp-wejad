import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventDeletionHandlerProps {
  eventId: string;
  onSuccess: () => void;
}

export const handleEventDeletion = async ({ eventId, onSuccess }: EventDeletionHandlerProps) => {
  try {
    console.log('Starting deletion process for event:', eventId);
    
    // Delete all related records in the correct order to respect foreign key constraints
    const tables = [
      'event_feedback',
      'attendance_records',
      'notification_logs',
      'event_notification_settings',
      'event_reports',
      'registrations',
      'events'
    ];

    for (const table of tables) {
      console.log(`Deleting records from ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(table === 'events' ? 'id' : 'event_id', eventId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw error;
      }
    }

    console.log('Event and related records deleted successfully');
    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.error("حدث خطأ أثناء حذف الفعالية");
    throw error;
  }
};