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
import { EventType } from "@/types/event";

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

  console.log('EventDetailsContainer received props:', {
    event,
    isAdmin,
    id
  });

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
    console.log('Opening registration dialog');
    setIsRegistrationOpen(true);
  };

  if (!event) {
    console.log('No event data provided to EventDetailsContainer');
    return null;
  }

  // Convert Event to EventType
  const eventData: EventType = {
    ...event,
    eventType: event.event_type,
    beneficiaryType: event.beneficiary_type,
    certificateType: event.certificate_type,
    eventHours: event.event_hours
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EventContainer>
        <div className="flex-grow">
          <EventDetailsHeader
            event={eventData}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAddToCalendar={onAddToCalendar}
          />

          <EventDetailsContent 
            event={eventData}
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