import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/store/eventStore";
import { getEventStatus } from "@/utils/eventUtils";
import { EventRegistrationSystem } from "../EventRegistrationSystem";
import { RegistrationStatusAlert } from "./RegistrationStatusAlert";

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
  const status = getEventStatus(event);
  console.log('Event registration status:', status);

  if (status !== 'available' && open) {
    console.log('Closing dialog because registration is not allowed');
    onOpenChange(false);
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-right">
            تسجيل الحضور في {event.title}
          </DialogTitle>
        </DialogHeader>

        {status !== 'available' ? (
          <RegistrationStatusAlert status={status} />
        ) : (
          <EventRegistrationSystem 
            event={event}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};