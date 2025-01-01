import { Button } from "@/components/ui/button";
import { EventStatus } from "@/types/eventStatus";
import { getStatusConfig } from "@/utils/eventStatusConfig";

interface EventRegistrationButtonProps {
  status: EventStatus;
  onRegister: () => void;
}

export const EventRegistrationButton = ({ 
  status, 
  onRegister 
}: EventRegistrationButtonProps) => {
  console.log('EventRegistrationButton status:', status);
  
  const config = getStatusConfig(status);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Register button clicked');
    onRegister();
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