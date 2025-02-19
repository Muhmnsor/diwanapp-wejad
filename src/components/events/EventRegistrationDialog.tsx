
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Event } from "@/store/eventStore";
import { RegistrationForm } from "./RegistrationForm";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        className="w-[90%] sm:max-w-[425px] rtl rounded-xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] p-0"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="p-6">
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
