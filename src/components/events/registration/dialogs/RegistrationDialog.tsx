import { Event } from "@/store/eventStore";
import { RegistrationForm } from "../../RegistrationForm";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export const RegistrationDialog = ({
  open,
  onOpenChange,
  event,
}: RegistrationDialogProps) => {
  console.log('RegistrationDialog - Rendering with props:', {
    open,
    eventTitle: event.title,
    eventId: event.id
  });

  const handleSubmit = () => {
    console.log('RegistrationDialog - Registration submitted, calling onOpenChange(false)');
    onOpenChange(false);
  };

  return (
    <RegistrationForm
      eventTitle={event.title}
      eventPrice={event.price}
      eventDate={event.date}
      eventTime={event.time}
      eventLocation={event.location}
      onSubmit={handleSubmit}
    />
  );
};