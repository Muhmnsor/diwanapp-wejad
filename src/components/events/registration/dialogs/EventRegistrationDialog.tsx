
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormEvent } from "react";
import { RegistrationForm } from "../../RegistrationForm";
import { Event } from "@/store/eventStore";

interface EventRegistrationDialogProps {
  event: Event;
  showDialog: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
}

export const EventRegistrationDialog = ({
  event,
  showDialog,
  onClose,
  onSubmit,
}: EventRegistrationDialogProps) => {
  console.log('📝 EventRegistrationDialog - Event:', {
    title: event.title,
    location: event.location,
    location_url: event.location_url
  });

  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
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
          location_url={event.location_url}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
