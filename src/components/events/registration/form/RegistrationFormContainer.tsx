
import { FormEvent } from "react";
import { useRegistration } from "../hooks/useRegistration";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { useParams } from "react-router-dom";
import { RegistrationFormFields } from "./RegistrationFormFields";
import { RegistrationFormActions } from "./RegistrationFormActions";
import { RegistrationConfirmation } from "./RegistrationConfirmation";
import { LoadingState, ErrorState } from "../components/RegistrationFormStates";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
}

export const RegistrationFormContainer = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: RegistrationFormContainerProps) => {
  const { id } = useParams();
  console.log('🎯 RegistrationFormContainer - Event ID:', id);

  const {
    formData,
    setFormData,
    isSubmitting,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    handleSubmit
  } = useRegistration(() => {
    if (onSubmit) {
      const syntheticEvent = { preventDefault: () => {} } as FormEvent<Element>;
      onSubmit(syntheticEvent);
    }
  }, false);

  const { data: registrationFields, isLoading, error } = useRegistrationFields(id);

  console.log('📝 Form Data:', formData);
  console.log('🔧 Registration Fields Config:', registrationFields);
  console.log('✨ Show Confirmation:', showConfirmation);
  console.log('🆔 Registration ID:', registrationId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('❌ Error in registration form:', error);
    return <ErrorState error={error} />;
  }

  if (!registrationFields) {
    console.error('❌ No registration fields available');
    return <ErrorState error={new Error('No registration fields available')} />;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <RegistrationFormFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
          showPaymentFields={isPaidEvent}
          registrationFields={registrationFields}
        />
        <RegistrationFormActions
          isSubmitting={isSubmitting}
          isPaidEvent={isPaidEvent}
          eventPrice={eventPrice}
        />
      </form>

      <RegistrationConfirmation
        registrationId={registrationId}
        eventTitle={eventTitle}
        formData={formData}
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
      />
    </>
  );
};
