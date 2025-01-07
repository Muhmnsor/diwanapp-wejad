import { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { RegistrationFormInputs } from "@/components/events/RegistrationFormInputs";
import { Button } from "@/components/ui/button";
import { useRegistration } from "../hooks/useRegistration";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "../components/RegistrationFormStates";

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
  console.log('🎯 RegistrationFormContainer - Event/Project ID:', id);

  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit
  } = useRegistration(() => {
    if (onSubmit) {
      onSubmit(new Event('submit'));
    }
  }, isProject);

  const { data: registrationFields, isLoading, error } = useRegistrationFields(id);

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
  const buttonText = isSubmitting ? "جاري المعالجة..." : isPaidEvent ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : "تأكيد التسجيل";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <RegistrationFormInputs
        formData={formData}
        setFormData={setFormData}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        registrationFields={registrationFields}
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {buttonText}
      </Button>
    </form>
  );
};