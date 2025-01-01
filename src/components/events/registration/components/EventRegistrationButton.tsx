import { Button } from "@/components/ui/button";

interface EventRegistrationButtonProps {
  isSubmitting: boolean;
  isPaidEvent: boolean;
  eventPrice: number | "free" | null;
}

export const EventRegistrationButton = ({
  isSubmitting,
  isPaidEvent,
  eventPrice
}: EventRegistrationButtonProps) => {
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