import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EventStatus } from "@/types/eventStatus";

interface RegistrationStatusAlertProps {
  status: EventStatus;
}

export const RegistrationStatusAlert = ({ status }: RegistrationStatusAlertProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'full':
        return "اكتمل التسجيل";
      case 'ended':
        return "انتهى التسجيل";
      case 'notStarted':
        return "لم يبدأ التسجيل بعد";
      case 'eventStarted':
        return "انتهت الفعالية";
      default:
        return "";
    }
  };

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {getStatusMessage()}
      </AlertDescription>
    </Alert>
  );
};