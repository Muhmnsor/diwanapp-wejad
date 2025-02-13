
import { useEffect, useState } from "react";
import { Event } from "@/types/event";
import { EditEventDialog } from "./EditEventDialog";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { useAuthStore } from "@/store/authStore";
import { EventDeleteDialog } from "./details/EventDeleteDialog";
import { handleEventUpdate } from "./details/handlers/EventUpdateHandler";
import { handleEventDelete } from "./details/handlers/EventDeleteHandler";
import { EventDetailsContainer } from "./details/EventDetailsContainer";
import { useUserRoles } from "./admin/useUserRoles";

interface EventDetailsViewProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onAddToCalendar: () => void;
  id: string;
}

export const EventDetailsView = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  id,
}: EventDetailsViewProps) => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(event);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const { data: userRoles } = useUserRoles();

  console.log('EventDetailsView - Event:', event);
  console.log('EventDetailsView - User:', user);
  console.log('EventDetailsView - User Roles:', userRoles);
  console.log('EventDetailsView - isAdmin:', isAdmin);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const result = await handleEventUpdate(updatedEvent, id);
    if (result) {
      setCurrentEvent(result);
    }
  };

  const handleRegister = () => {
    console.log('Opening registration dialog');
    setIsRegistrationOpen(true);
  };

  const handleDelete = async () => {
    await handleEventDelete({
      id,
      onSuccess: onDelete
    });
    setIsDeleteDialogOpen(false);
  };

  if (!currentEvent) return null;

  const hasAdminAccess = isAdmin || (userRoles && userRoles.includes('admin'));

  return (
    <>
      <EventDetailsContainer
        event={currentEvent}
        isAdmin={hasAdminAccess}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onAddToCalendar={onAddToCalendar}
        onRegister={handleRegister}
        id={id}
      />

      <EditEventDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        event={currentEvent} 
        onSave={handleUpdateEvent} 
      />

      <EventRegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
        event={currentEvent}
      />

      <EventDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};
