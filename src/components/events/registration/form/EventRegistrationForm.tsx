import { FormEvent } from "react";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { useParams } from "react-router-dom";
import { EventRegistrationFields } from "./EventRegistrationFields";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";

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
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting 
          ? "جاري المعالجة..." 
          : isPaidEvent 
            ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` 
            : "تأكيد التسجيل"
        }
      </Button>
    </form>
  );
};