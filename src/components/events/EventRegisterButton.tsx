import { Button } from "@/components/ui/button";
import { EventStatus, getStatusConfig } from "@/utils/eventUtils";

interface EventRegisterButtonProps {
  status: EventStatus;
  onRegister: () => void;
}

export const EventRegisterButton = ({ status, onRegister }: EventRegisterButtonProps) => {
  console.log('EventRegisterButton status:', status);
  
  const config = getStatusConfig(status);

  return (
    <Button 
      size="lg" 
      className={`w-full rounded-2xl h-14 text-lg ${config.className}`}
      onClick={onRegister}
      disabled={config.disabled}
    >
      {config.text}
    </Button>
  );
};