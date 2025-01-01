import { RegistrationDialog } from "./registration/dialogs/RegistrationDialog";
import { Event } from "@/store/eventStore";

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export const EventRegistrationDialog = ({
  open,
  onOpenChange,
  event,
}: EventRegistrationDialogProps) => {
  return (
    <RegistrationDialog
      open={open}
      onOpenChange={onOpenChange}
      event={event}
    />
  );
};