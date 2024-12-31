import { Event } from "@/store/eventStore";
import { EditEventDialog } from "../EditEventDialog";
import { EventRegistrationDialog } from "../EventRegistrationDialog";
import { EventDeleteDialog } from "./EventDeleteDialog";

interface EventDetailsDialogsProps {
  event: Event | null;
  isEditDialogOpen: boolean;
  isRegistrationOpen: boolean;
  isDeleteDialogOpen: boolean;
  onEditDialogChange: (open: boolean) => void;
  onRegistrationDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onEventUpdate: (updatedEvent: Event) => Promise<void>;
  onEventDelete: () => Promise<void>;
}

export const EventDetailsDialogs = ({
  event,
  isEditDialogOpen,
  isRegistrationOpen,
  isDeleteDialogOpen,
  onEditDialogChange,
  onRegistrationDialogChange,
  onDeleteDialogChange,
  onEventUpdate,
  onEventDelete
}: EventDetailsDialogsProps) => {
  if (!event) return null;

  return (
    <>
      <EditEventDialog 
        open={isEditDialogOpen} 
        onOpenChange={onEditDialogChange} 
        event={event} 
        onSave={onEventUpdate} 
      />

      <EventRegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={onRegistrationDialogChange}
        event={event}
      />

      <EventDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onEventDelete}
      />
    </>
  );
};