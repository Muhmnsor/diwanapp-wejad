import { Button } from "@/components/ui/button";

interface RegistrationFormActionsProps {
  isSubmitting: boolean;
  isPaidEvent: boolean;
  eventPrice: number | "free" | null;
}

export const RegistrationFormActions = ({
  isSubmitting,
  isPaidEvent,
  eventPrice
}: RegistrationFormActionsProps) => {
  const buttonText = isSubmitting 
    ? "جاري المعالجة..." 
    : isPaidEvent 
      ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` 
      : "تأكيد التسجيل";

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting}
    >
      {buttonText}
    </Button>
  );
};