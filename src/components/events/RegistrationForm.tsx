import { RegistrationFormContainer } from "./registration/RegistrationFormContainer";
import { RegistrationConfirmation } from "./RegistrationConfirmation";
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

  if (!isRegistered) {
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

  return (
    <RegistrationConfirmation
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      formData={formData}
      isProjectActivity={isProject}
      onPayment={() => {}}
    />
  );
};