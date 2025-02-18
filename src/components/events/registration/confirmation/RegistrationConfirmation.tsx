
import { RegistrationFormData } from "../types/registration";
import { EventConfirmationDialog } from "../../confirmation/EventConfirmationDialog";

interface RegistrationConfirmationProps {
  registrationId: string;
  eventTitle: string;
  eventLocation?: string;
  eventDate?: string;
  eventTime?: string;
  location_url?: string;
  formData: RegistrationFormData;
  showConfirmation: boolean;
  setShowConfirmation: (show: boolean) => void;
}

export const RegistrationConfirmation = ({
  registrationId,
  eventTitle,
  eventLocation,
  eventDate,
  eventTime,
  location_url,
  formData,
  showConfirmation,
  setShowConfirmation
}: RegistrationConfirmationProps) => {
  console.log('RegistrationConfirmation render:', {
    registrationId,
    eventTitle,
    eventLocation,
    location_url,
    showConfirmation
  });

  return (
    <EventConfirmationDialog
      open={showConfirmation}
      onOpenChange={(open) => {
        console.log('Dialog state changed to:', open);
        setShowConfirmation(open);
      }}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventLocation={eventLocation}
      eventDate={eventDate}
      eventTime={eventTime}
      location_url={location_url}
      formData={{
        name: formData.arabicName,
        email: formData.email,
        phone: formData.phone
      }}
    />
  );
};
