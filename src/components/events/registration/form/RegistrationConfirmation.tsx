
import { RegistrationFormData } from "../types/registration";
import { EventConfirmationDialog } from "../../confirmation/EventConfirmationDialog";

interface RegistrationConfirmationProps {
  registrationId: string;
  eventTitle: string;
  formData: RegistrationFormData;
  showConfirmation: boolean;
}

export const RegistrationConfirmation = ({
  registrationId,
  eventTitle,
  formData,
  showConfirmation
}: RegistrationConfirmationProps) => {
  console.log('RegistrationConfirmation render:', {
    registrationId,
    eventTitle,
    showConfirmation
  });

  return (
    <EventConfirmationDialog
      open={showConfirmation}
      onOpenChange={() => {
        console.log('Dialog state changed');
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
