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
  } = useRegistration((id: string, data: any) => {
    console.log('RegistrationForm - Registration successful:', { id, data });
    if (onSubmit) {
      onSubmit({ registrationId: id, formData: data });
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
      formData={formData}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      isProject={isProject}
    />
  );
};