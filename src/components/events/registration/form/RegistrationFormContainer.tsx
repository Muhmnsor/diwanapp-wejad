import { FormEvent } from "react";
import { useRegistration } from "../hooks/useRegistration";
import { RegistrationFormFields } from "./RegistrationFormFields";
import { RegistrationFormActions } from "./RegistrationFormActions";
import { RegistrationConfirmation } from "./RegistrationConfirmation";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const RegistrationFormContainer = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: RegistrationFormContainerProps) => {
  const {
    formData,
    setFormData,
    showConfirmation,
    registrationId,
    isSubmitting,
    handleSubmit
  } = useRegistration(onSubmit, false);

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <RegistrationFormFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
          showPaymentFields={isPaidEvent}
        />
        
        <RegistrationFormActions
          isSubmitting={isSubmitting}
          isPaidEvent={isPaidEvent}
          eventPrice={eventPrice}
        />
      </form>

      {showConfirmation && (
        <RegistrationConfirmation
          registrationId={registrationId}
          eventTitle={eventTitle}
          formData={formData}
          showConfirmation={showConfirmation}
        />
      )}
    </>
  );
};