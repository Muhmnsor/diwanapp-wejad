import { Event } from "@/store/eventStore";
import { useState } from "react";
import { EventConfirmationDialog } from "./confirmation/EventConfirmationDialog";
import { useRegistration } from "./registration/hooks/useRegistration";
import { RegistrationForm } from "./RegistrationForm";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    formData,
    registrationId,
    isRegistered
  } = useRegistration(() => {
    console.log('Registration successful, showing confirmation');
    setShowConfirmation(true);
  }, false);

  console.log('EventRegistrationDialog - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  if (showConfirmation && isRegistered) {
    console.log('Showing confirmation dialog');
    return (
      <EventConfirmationDialog
        open={open}
        onOpenChange={onOpenChange}
        registrationId={registrationId}
        eventTitle={event.title}
        eventDate={event.date}
        eventTime={event.time}
        eventLocation={event.location}
        formData={{
          name: formData.arabicName,
          email: formData.email,
          phone: formData.phone
        }}
      />
    );
  }

  return (
    <RegistrationForm
      eventTitle={event.title}
      eventPrice={event.price}
      eventDate={event.date}
      eventTime={event.time}
      eventLocation={event.location}
      onSubmit={() => {
        console.log('Registration form submitted');
        onOpenChange(false);
      }}
    />
  );
};