import { RegistrationFormContainer } from "./RegistrationFormContainer";
import { RegistrationConfirmation } from "@/components/events/RegistrationConfirmation";
import { useRegistration } from "./hooks/useRegistration";

interface EventRegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: React.FormEvent) => void;
  isProject?: boolean;
}

export const EventRegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: EventRegistrationFormProps) => {
  const {
    formData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isRegistered,
    handleSubmit
  } = useRegistration(onSubmit, isProject);

  console.log('Registration state:', {
    showConfirmation,
    isRegistered,
    registrationId
  });

  if (isRegistered && showConfirmation) {
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
  }

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