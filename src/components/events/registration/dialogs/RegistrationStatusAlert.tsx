import { Alert, AlertDescription } from "@/components/ui/alert";
import { EventStatus } from "@/types/eventStatus";
import { getStatusConfig } from "@/utils/eventStatusConfig";

interface RegistrationStatusAlertProps {
  status: EventStatus;
}

export const RegistrationStatusAlert = ({ status }: RegistrationStatusAlertProps) => {
  const config = getStatusConfig(status);
  
  return (
    <Alert variant="destructive">
      <AlertDescription>
        {config.text}
      </AlertDescription>
    </Alert>
  );
};