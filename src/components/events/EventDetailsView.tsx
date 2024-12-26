import { EventType } from "@/types/event";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { EventHeader } from "./EventHeader";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { EventContainer } from "./EventContainer";
import { EventFooter } from "./EventFooter";
import { EventDetailsHeader } from "./details/EventDetailsHeader";
import { EventDetailsContent } from "./details/EventDetailsContent";
import { EventDeleteDialog } from "./details/EventDeleteDialog";
import { useRegistrations } from "@/hooks/useRegistrations";

interface EventDetailsViewProps {
  event: EventType;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
}

export const EventDetailsView = ({ 
  event, 
  onEdit, 
  onDelete, 
  onAddToCalendar,
  onRegister,
}: EventDetailsViewProps) => {
  const { user } = useAuthStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { data: registrationCounts } = useRegistrations();

  console.log('Event data in EventDetailsView:', event);
  console.log('Registration counts:', registrationCounts);
  console.log('Max attendees from event:', event.maxAttendees);

  if (!event) {
    return <div className="text-center p-8">لا توجد بيانات للفعالية</div>;
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete();
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
    maxAttendees: event.maxAttendees || 0
  };

  return (
    <EventContainer>
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
  );
};