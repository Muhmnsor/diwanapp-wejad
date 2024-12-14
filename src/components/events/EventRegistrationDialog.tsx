import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationForm } from "./RegistrationForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventPrice: number | "free";
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
}

export const EventRegistrationDialog = ({
  open,
  onOpenChange,
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  registrationStartDate,
  registrationEndDate,
}: EventRegistrationDialogProps) => {
  const checkRegistrationPeriod = () => {
    const now = new Date();
    
    if (registrationStartDate) {
      const startDate = new Date(registrationStartDate);
      console.log('Checking registration start date:', {
        now,
        startDate,
        registrationStartDate
      });
      if (now < startDate) {
        return {
          canRegister: false,
          message: "لم يبدأ التسجيل بعد"
        };
      }
    }

    if (registrationEndDate) {
      const endDate = new Date(registrationEndDate);
      if (now > endDate) {
        return {
          canRegister: false,
          message: "انتهى التسجيل"
        };
      }
    }

    return {
      canRegister: true,
      message: ""
    };
  };

  const registrationStatus = checkRegistrationPeriod();
  console.log('Registration status:', registrationStatus);

  // إغلاق النافذة إذا كان التسجيل غير متاح
  if (!registrationStatus.canRegister && open) {
    console.log('Closing dialog because registration is not allowed');
    onOpenChange(false);
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل الحضور في {eventTitle}</DialogTitle>
        </DialogHeader>
        {!registrationStatus.canRegister ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {registrationStatus.message}
            </AlertDescription>
          </Alert>
        ) : (
          <RegistrationForm
            eventTitle={eventTitle}
            eventPrice={eventPrice}
            eventDate={eventDate}
            eventTime={eventTime}
            eventLocation={eventLocation}
            onSubmit={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};