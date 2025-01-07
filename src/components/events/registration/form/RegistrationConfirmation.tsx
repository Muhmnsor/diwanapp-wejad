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
  return (
    <EventConfirmationDialog
      open={showConfirmation}
      onOpenChange={() => {}}
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