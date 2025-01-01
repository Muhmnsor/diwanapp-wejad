import { FormEvent } from "react";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { useParams } from "react-router-dom";
import { EventRegistrationFields } from "../fields/EventRegistrationFields";
import { EventRegistrationButton } from "../components/EventRegistrationButton";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { useRegistration } from "../hooks/useRegistration";

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

  console.log('EventRegistrationForm - Fields:', registrationFields);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
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