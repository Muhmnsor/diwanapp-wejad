import { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { RegistrationFormInputs } from "@/components/events/RegistrationFormInputs";
import { Button } from "@/components/ui/button";
import { useRegistration } from "../hooks/useRegistration";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "../components/RegistrationFormStates";

interface EventRegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
}

export const EventRegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isSubmitting
}: EventRegistrationFormProps) => {
  const { id } = useParams();
  const { data: registrationFields, isLoading, error } = useRegistrationFields(id);
  const { formData, setFormData } = useRegistration(() => {}, false);

  console.log('📋 EventRegistrationForm - Registration Fields:', registrationFields);
  console.log('📝 EventRegistrationForm - Form Data:', formData);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('❌ Error loading registration fields:', error);
    return <ErrorState error={error} />;
  }

  if (!registrationFields) {
    console.error('❌ No registration fields available');
    return <ErrorState error={new Error('No registration fields available')} />;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;
  const buttonText = isSubmitting 
    ? "جاري المعالجة..." 
    : isPaidEvent 
      ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` 
      : "تأكيد التسجيل";

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <RegistrationFormInputs
        registrationFields={registrationFields}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        formData={formData}
        setFormData={setFormData}
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