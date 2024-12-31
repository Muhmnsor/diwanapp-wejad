import { RegistrationFormContainer } from "./RegistrationFormContainer";
import { EventRegistrationConfirmation } from "./confirmation/EventRegistrationConfirmation";
import { useRegistration } from "./hooks/useRegistration";

interface EventRegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const EventRegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
}: EventRegistrationFormProps) => {
  const {
    formData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isRegistered,
    handleSubmit
  } = useRegistration(() => {
    console.log('EventRegistrationForm - Registration successful, calling onSubmit');
    if (onSubmit) {
      onSubmit();
    }
  }, false);

  console.log('EventRegistrationForm - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  if (!isRegistered) {
    console.log('EventRegistrationForm - Showing registration form');
    return (
      <RegistrationFormContainer
        eventTitle={eventTitle}
        eventPrice={eventPrice}
        eventDate={eventDate}
        eventTime={eventTime}
        eventLocation={eventLocation}
        onSubmit={handleSubmit}
      />
    );
  }

  // Transform formData to match confirmation expectations
  const confirmationFormData = {
    name: formData.arabicName,
    email: formData.email,
    phone: formData.phone
  };

  console.log('EventRegistrationForm - Showing confirmation dialog with data:', {
    registrationId,
    eventTitle,
    confirmationFormData
  });

  return (
    <EventRegistrationConfirmation
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      formData={confirmationFormData}
    />
  );
};