import { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { RegistrationFormInputs } from "@/components/events/RegistrationFormInputs";
import { useRegistration } from "./hooks/useRegistration";
import { useRegistrationFields } from "./hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "./components/RegistrationFormStates";
import { RegistrationFormButton } from "./components/RegistrationFormButton";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
  isProject?: boolean;
}

export const RegistrationFormContainer = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: RegistrationFormContainerProps) => {
  const { id } = useParams();
  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit
  } = useRegistration(() => {
    if (onSubmit) {
      const syntheticEvent = { preventDefault: () => {} } as FormEvent;
      onSubmit(syntheticEvent);
    }
  }, isProject);

  const handleFormDataChange = (newData: any) => {
    setFormData({
      ...newData,
      name: newData.arabicName
    });
  };

  const { data: registrationFields, isLoading, error } = useRegistrationFields(id);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  console.log('Registration fields being passed to form:', registrationFields);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <RegistrationFormInputs
        formData={formData}
        setFormData={handleFormDataChange}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        registrationFields={registrationFields}
      />
      <RegistrationFormButton
        isSubmitting={isSubmitting}
        isPaidEvent={isPaidEvent}
        eventPrice={eventPrice}
      />
    </form>
  );
};