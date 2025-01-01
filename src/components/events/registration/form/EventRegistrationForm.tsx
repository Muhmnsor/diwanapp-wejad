import { FormEvent } from "react";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { useParams } from "react-router-dom";
import { EventRegistrationFields } from "../fields/EventRegistrationFields";
import { EventRegistrationButton } from "../components/EventRegistrationButton";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { useRegistration } from "../hooks/useRegistration";
import { toast } from "sonner";

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
    return <LoadingSpinner />;
  }

  if (error) {
    console.error('❌ Error loading registration fields:', error);
    toast.error('حدث خطأ في تحميل نموذج التسجيل');
    return <ErrorState error={error} />;
  }

  if (!registrationFields) {
    console.error('❌ No registration fields available');
    toast.error('حدث خطأ في تحميل نموذج التسجيل');
    return <ErrorState error={new Error('No registration fields available')} />;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <EventRegistrationFields
        registrationFields={registrationFields}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        formData={formData}
        setFormData={setFormData}
      />
      <EventRegistrationButton 
        isSubmitting={isSubmitting}
        isPaidEvent={isPaidEvent}
        eventPrice={eventPrice}
      />
    </form>
  );
};