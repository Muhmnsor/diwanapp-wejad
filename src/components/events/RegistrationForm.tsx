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
  } = useRegistration(onSubmit, isProject);

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
        onSubmit={onSubmit}
        isProject={isProject}
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