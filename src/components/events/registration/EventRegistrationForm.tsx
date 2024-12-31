import { RegistrationFormContainer } from "./RegistrationFormContainer";
import { RegistrationConfirmation } from "@/components/events/RegistrationConfirmation";
import { useRegistration } from "./hooks/useRegistration";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  
  const {
    formData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isRegistered,
    handleSubmit
  } = useRegistration(() => {
    console.log('Registration successful, calling onSubmit callback');
    queryClient.invalidateQueries({ queryKey: ['registrations'] });
    if (onSubmit) {
      onSubmit();
    }
  }, false);

  console.log('EventRegistrationForm - Registration state:', {
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

  // Transform formData to match RegistrationConfirmation expectations
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
    <RegistrationConfirmation
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      formData={confirmationFormData}
      isProjectActivity={false}
      onPayment={() => {}}
    />
  );
};