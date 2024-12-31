import { useRegistrationState } from "./state/useRegistrationState";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { RegistrationFormInputs } from "../RegistrationFormInputs";
import { Button } from "@/components/ui/button";

interface EventRegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
  isProject?: boolean;
}

export const EventRegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: EventRegistrationFormProps) => {
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleSubmit
  } = useRegistrationState(onSubmit);

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <form onSubmit={(e) => handleSubmit(e, eventPrice)} className="space-y-4 mt-4">
      <RegistrationFormInputs
        formData={formData}
        setFormData={setFormData}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        errors={errors}
      />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <LoadingIndicator />
        ) : (
          isPaidEvent ? 
            `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : 
            "تأكيد التسجيل"
        )}
      </Button>
    </form>
  );
};