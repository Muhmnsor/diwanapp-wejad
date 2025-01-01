import { EventRegistrationConfirmation } from "../confirmation/EventRegistrationConfirmation";

interface RegistrationConfirmationProps {
  showConfirmation: boolean;
  setShowConfirmation: (show: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
}

export const RegistrationConfirmation = ({
  showConfirmation,
  setShowConfirmation,
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  formData
}: RegistrationConfirmationProps) => {
  console.log('RegistrationConfirmation - Showing confirmation dialog');
  
  return (
    <EventRegistrationConfirmation
      open={showConfirmation}
      onOpenChange={setShowConfirmation}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      formData={formData}
    />
  );
};