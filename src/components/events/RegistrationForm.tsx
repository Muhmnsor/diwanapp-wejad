import { RegistrationFormContainer } from "./registration/RegistrationFormContainer";
import { EventRegistrationConfirmation } from "./registration/confirmation/EventRegistrationConfirmation";
import { useRegistration } from "./registration/hooks/useRegistration";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
  isProject?: boolean;
}

export const RegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: RegistrationFormProps) => {
  const {
    formData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isRegistered
  } = useRegistration(() => {
    console.log('RegistrationForm - Registration successful, calling onSubmit');
    if (onSubmit) {
      onSubmit();
    }
  }, isProject);

  console.log('RegistrationForm - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  if (isRegistered && showConfirmation) {
    console.log('RegistrationForm - Showing confirmation dialog with data:', {
      registrationId,
      eventTitle,
      formData
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
        formData={{
          name: formData.arabicName,
          email: formData.email,
          phone: formData.phone
        }}
      />
    );
  }

  console.log('RegistrationForm - Showing registration form');
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={onSubmit}
      isProject={isProject}
    />
  );
};