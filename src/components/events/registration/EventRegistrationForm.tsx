import { useRegistration } from "./hooks/useRegistration";
import { SessionManager } from "./session/SessionManager";
import { RegistrationFormContainer } from "./form/RegistrationFormContainer";
import { RegistrationConfirmation } from "./confirmation/RegistrationConfirmation";
import { FormEvent } from "react";

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
    handleSubmit: registrationSubmit
  } = useRegistration(() => {
    console.log('EventRegistrationForm - Registration successful, calling onSubmit');
    // Ensure we call onSubmit after a successful registration
    if (onSubmit) {
      setTimeout(() => {
        onSubmit();
      }, 0);
    }
  }, false);

  console.log('EventRegistrationForm - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, calling registrationSubmit');
    await registrationSubmit(e);
  };

  return (
    <SessionManager>
      {showConfirmation && isRegistered ? (
        <RegistrationConfirmation
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          registrationId={registrationId}
          eventTitle={eventTitle}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          formData={{
            name: formData.arabicName,
            email: formData.email,
            phone: formData.phone
          }}
        />
      ) : (
        <RegistrationFormContainer
          eventTitle={eventTitle}
          eventPrice={eventPrice}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          onSubmit={handleFormSubmit}
        />
      )}
    </SessionManager>
  );
};