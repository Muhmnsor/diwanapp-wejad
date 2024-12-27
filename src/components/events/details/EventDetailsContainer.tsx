import { Event } from "@/store/eventStore";
import { EventDetailsHeader } from "./EventDetailsHeader";
import { EventDetailsContent } from "./EventDetailsContent";
import { EventContainer } from "../EventContainer";
import { EventFooter } from "../EventFooter";
import { EventRegistrationDialog } from "../EventRegistrationDialog";
import { EventDeleteDialog } from "./EventDeleteDialog";
import { useState } from "react";
import { handleEventDeletion } from "./EventDeletionHandler";
import { useNavigate } from "react-router-dom";

interface EventDetailsContainerProps {
  event: Event & { attendees: number };
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  isAdmin: boolean;
  id: string;
}

export const EventDetailsContainer = ({
  event,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  isAdmin,
  id
}: EventDetailsContainerProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await handleEventDeletion({
        eventId: id,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          navigate('/');
        }
      });
    } catch (error) {
      console.error('Error handling event deletion:', error);
    }
  };

  const handleRegister = () => {
    setIsRegistrationOpen(true);
  };

  const transformedEvent = {
    ...event,
    eventType: event.event_type,
    certificateType: event.certificate_type,
    eventHours: event.event_hours,
    maxAttendees: event.max_attendees,
    beneficiaryType: event.beneficiary_type,
    beneficiary_type: event.beneficiary_type,
    eventPath: event.event_path,
    event_path: event.event_path,
    eventCategory: event.event_category,
    event_category: event.event_category
  };

  console.log('Transformed event:', transformedEvent);

  return (
    <div className="min-h-screen flex flex-col">
      <EventContainer>
        <div className="flex-grow">
          <EventDetailsHeader
            event={transformedEvent}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
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