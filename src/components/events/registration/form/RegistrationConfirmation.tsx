
import { RegistrationFormData } from "../types/registration";
import { EventConfirmationDialog } from "../../confirmation/EventConfirmationDialog";

interface RegistrationConfirmationProps {
  registrationId: string;
  eventTitle: string;
  formData: RegistrationFormData;
  showConfirmation: boolean;
  setShowConfirmation: (show: boolean) => void;
}

export const RegistrationConfirmation = ({
  registrationId,
  eventTitle,
  formData,
  showConfirmation,
  setShowConfirmation
}: RegistrationConfirmationProps) => {
  console.log('RegistrationConfirmation render:', {
    registrationId,
    eventTitle,
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
      formData={{
        name: formData.arabicName,
        email: formData.email,
        phone: formData.phone
      }}
    />
  );
};
