import { RegistrationFormContainer } from "./registration/RegistrationFormContainer";
import { useRegistration } from "./registration/hooks/useRegistration";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (data: { registrationId: string; formData: any }) => void;
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
    isSubmitting,
    handleSubmit,
    registrationId,
    isRegistered
  } = useRegistration(() => {
    if (registrationId && formData) {
      console.log('RegistrationForm - Registration successful:', { registrationId, formData });
      onSubmit({ registrationId, formData });
    }
  }, isProject);

  console.log('RegistrationForm - Current state:', {
    isRegistered,
    registrationId,
    formData
  });

  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={handleSubmit}
      isProject={isProject}
    />
  );
};