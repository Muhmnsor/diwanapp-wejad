import { Button } from "@/components/ui/button";
import { EventStatus } from "@/types/eventStatus";
import { getStatusConfig } from "@/utils/eventStatusConfig";

interface EventRegisterButtonProps {
  status: EventStatus;
  onRegister: () => void;
  isProject?: boolean;
}

export const EventRegisterButton = ({ status, onRegister, isProject = false }: EventRegisterButtonProps) => {
  const config = getStatusConfig(status);

  return (
    <Button 
      size="lg" 
      className={`w-full rounded-2xl h-14 text-lg ${config.className}`}
      onClick={onRegister}
      disabled={config.disabled}
      variant={status === 'available' ? 'default' : 'secondary'}
    >
      {isProject ? "سجل في المشروع" : config.text}
    </Button>
  );
};