
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/store/eventStore";
import { RegistrationForm } from "./RegistrationForm";

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
  console.log('📋 EventRegistrationDialog - Event:', event);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px] rtl mx-auto mx-4 rounded-xl"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل الحضور في {event.title}</DialogTitle>
        </DialogHeader>
        <div className="rtl px-4" dir="rtl">
          <RegistrationForm
            eventTitle={event.title}
            eventPrice={event.price}
            eventDate={event.date}
            eventTime={event.time}
            eventLocation={event.location}
            location_url={event.location_url}
            onSubmit={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
