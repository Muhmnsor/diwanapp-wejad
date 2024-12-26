import { Button } from "@/components/ui/button";
import { EventStatus } from "@/types/eventStatus";
import { getStatusConfig } from "@/utils/eventStatusConfig";
import { useEffect } from "react";

interface EventRegisterButtonProps {
  status: EventStatus;
  onRegister: () => void;
}

export const EventRegisterButton = ({ status, onRegister }: EventRegisterButtonProps) => {
  useEffect(() => {
    console.log('EventRegisterButton status:', status);
  }, [status]);
  
  const config = getStatusConfig(status);

  const handleClick = () => {
    if (status === 'available') {
      console.log('Registration button clicked, status:', status);
      onRegister();
    } else {
      console.log('Registration button clicked but disabled, status:', status);
    }
  };

  // تحديث شرط التعطيل ليشمل حالة 'notStarted'
  const isDisabled = status !== 'available' || status === 'notStarted';

  return (
    <Button 
      size="lg" 
      className={`w-full rounded-2xl h-14 text-lg ${config.className}`}
      onClick={handleClick}
      disabled={isDisabled}
      variant={status === 'available' ? 'default' : 'secondary'}
    >
      {config.text}
    </Button>
  );
};