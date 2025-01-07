import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventRegistrationForm } from "./form/EventRegistrationForm";
import { EventRegistrationConfirmation } from "./confirmation/EventRegistrationConfirmation";
import { useRegistration } from "./hooks/useRegistration";

interface EventRegistrationSystemProps {
  event: Event;
  onClose: () => void;
}

export const EventRegistrationSystem = ({ event, onClose }: EventRegistrationSystemProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    formData,
    registrationId,
    isRegistered,
    handleSubmit,
    isSubmitting
  } = useRegistration(() => {
    setShowConfirmation(true);
    console.log('Registration successful, showing confirmation:', {
      registrationId,
      formData,
      isRegistered
    });
  }, false);

  console.log('EventRegistrationSystem - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  if (showConfirmation && isRegistered) {
    return (
      <EventRegistrationConfirmation
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
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
    <EventRegistrationForm
      eventTitle={event.title}
      eventPrice={event.price}
      eventDate={event.date}
      eventTime={event.time}
      eventLocation={event.location}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};