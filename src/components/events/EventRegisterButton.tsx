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
    console.log('Register button clicked with status:', status);
    if (!config.disabled) {
      onRegister();
    }
  };

  return (
    <Button 
      size="lg" 
      className={`w-full rounded-2xl h-14 text-lg ${config.className}`}
      onClick={handleClick}
      disabled={config.disabled}
      variant={status === 'available' ? 'default' : 'secondary'}
    >
      {config.text}
    </Button>
  );
};