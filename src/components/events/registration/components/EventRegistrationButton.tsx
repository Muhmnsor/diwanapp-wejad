import { Button } from "@/components/ui/button";

interface EventRegistrationButtonProps {
  isPaidEvent: boolean;
  eventPrice: number | "free" | null;
}

export const EventRegistrationButton = ({
  isPaidEvent,
  eventPrice
}: EventRegistrationButtonProps) => {
  const buttonText = isPaidEvent 
    ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)`
    : "تأكيد التسجيل";

  return (
    <Button 
      type="submit"
      className="w-full"
    >
      {buttonText}
    </Button>
  );
};