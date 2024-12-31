import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getEventStatus } from "@/utils/eventUtils";
import { Event } from "@/store/eventStore";
import { EventRegistrationForm } from "./registration/EventRegistrationForm";

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export const EventRegistrationDialog = ({
  open,
  onOpenChange,
  event,
}: EventRegistrationDialogProps) => {
  const status = getEventStatus(event);
  console.log('Registration status in dialog:', status);

  if (status !== 'available' && open) {
    console.log('Closing dialog because registration is not allowed. Status:', status);
    onOpenChange(false);
    return null;
  }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل الحضور في {event.title}</DialogTitle>
        </DialogHeader>
        {status !== 'available' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getStatusMessage()}
            </AlertDescription>
          </Alert>
        ) : (
          <EventRegistrationForm
            eventTitle={event.title}
            eventPrice={event.price}
            eventDate={event.date}
            eventTime={event.time}
            eventLocation={event.location}
            onSubmit={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};