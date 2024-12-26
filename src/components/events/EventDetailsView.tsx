import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventReportDialog } from "./EventReportDialog";
import { EventAdminTabs } from "./admin/EventAdminTabs";
import { useUserRoles } from "./admin/useUserRoles";
import { EventHeader } from "./EventHeader";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { EventContainer } from "./EventContainer";
import { EventFooter } from "./EventFooter";
import { EventDetailsHeader } from "./details/EventDetailsHeader";
import { EventDetailsContent } from "./details/EventDetailsContent";
import { EventDeleteDialog } from "./details/EventDeleteDialog";
import { useRegistrations } from "@/hooks/useRegistrations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface EventDetailsViewProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
}

export const EventDetailsView = ({ 
  event, 
  onEdit, 
  onDelete, 
  onAddToCalendar,
  onRegister,
  id
}: EventDetailsViewProps) => {
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { data: registrationCounts } = useRegistrations();

  console.log('Event data in EventDetailsView:', event);
  console.log('Registration counts:', registrationCounts);
  console.log('Max attendees from event:', event.max_attendees);
  console.log('Current user:', user);
  console.log('Is admin?:', user?.isAdmin);

  if (!event) {
    return <div className="text-center p-8">لا توجد بيانات للفعالية</div>;
  }

  const handleDelete = async () => {
    try {
      console.log('Starting deletion process for event:', event.id);
      
      // Delete attendance records first
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('event_id', event.id);
      
      if (attendanceError) {
        console.error('Error deleting attendance records:', attendanceError);
        throw attendanceError;
      }

      // Delete event feedback
      const { error: feedbackError } = await supabase
        .from('event_feedback')
        .delete()
        .eq('event_id', event.id);
      
      if (feedbackError) {
        console.error('Error deleting feedback:', feedbackError);
        throw feedbackError;
      }

      // Delete notification logs
      const { error: notificationError } = await supabase
        .from('notification_logs')
        .delete()
        .eq('event_id', event.id);
      
      if (notificationError) {
        console.error('Error deleting notification logs:', notificationError);
        throw notificationError;
      }

      // Delete notification settings
      const { error: settingsError } = await supabase
        .from('event_notification_settings')
        .delete()
        .eq('event_id', event.id);
      
      if (settingsError) {
        console.error('Error deleting notification settings:', settingsError);
        throw settingsError;
      }

      // Delete event reports
      const { error: reportsError } = await supabase
        .from('event_reports')
        .delete()
        .eq('event_id', event.id);
      
      if (reportsError) {
        console.error('Error deleting reports:', reportsError);
        throw reportsError;
      }

      // Delete registrations
      const { error: registrationsError } = await supabase
        .from('registrations')
        .delete()
        .eq('event_id', event.id);
      
      if (registrationsError) {
        console.error('Error deleting registrations:', registrationsError);
        throw registrationsError;
      }

      // Finally delete the event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
      
      if (eventError) {
        console.error('Error deleting event:', eventError);
        throw eventError;
      }

      console.log('Event and related records deleted successfully');
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف الفعالية بنجاح");
      onDelete();
    } catch (error) {
      console.error('Error in deletion process:', error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  const handleRegister = () => {
    setIsRegistrationOpen(true);
  };

  const currentAttendees = registrationCounts?.[event.id] || 0;

  const transformedEvent = {
    ...event,
    certificateType: event.certificateType || 'none',
    eventHours: event.eventHours || 0,
    attendees: currentAttendees,
    maxAttendees: event.max_attendees
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EventContainer>
        <div className="flex-grow">
          <EventDetailsHeader
            event={transformedEvent}
            isAdmin={user?.isAdmin}
            onEdit={onEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onShare={async () => {}}
            onAddToCalendar={onAddToCalendar}
          />

          <EventDetailsContent 
            event={transformedEvent}
            onRegister={handleRegister}
          />
        </div>

        <EventFooter />

        <EventRegistrationDialog
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          event={event}
        />

        <EventDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </EventContainer>
    </div>
  );
};