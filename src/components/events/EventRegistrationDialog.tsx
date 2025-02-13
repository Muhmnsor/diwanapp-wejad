
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/types/event";
import { RegistrationForm } from "./RegistrationForm";
import { getEventStatus } from "@/utils/eventUtils";

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
  const handleSubmit = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في {event.title}</DialogTitle>
        </DialogHeader>
        <RegistrationForm
          eventTitle={event.title}
          eventPrice={event.price}
          eventDate={event.date}
          eventTime={event.time}
          eventLocation={event.location}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
