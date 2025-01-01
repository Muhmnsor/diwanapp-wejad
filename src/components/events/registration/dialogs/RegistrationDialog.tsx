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
import { RegistrationForm } from "../RegistrationForm";
import { toast } from "sonner";

interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export const RegistrationDialog = ({
  open,
  onOpenChange,
  event,
}: RegistrationDialogProps) => {
  const status = getEventStatus(event);
  console.log('Event registration status:', status);

  // Don't allow registration for project activities
  if (event.is_project_activity) {
    console.log('Cannot register for project activities');
    if (open) {
      toast.error("لا يمكن التسجيل مباشرة في نشاط المشروع. يرجى التسجيل في المشروع نفسه.");
      onOpenChange(false);
    }
    return null;
  }

  if (status !== 'available' && open) {
    console.log('Closing dialog because registration is not allowed. Status:', status);
    onOpenChange(false);
    return null;
  }

  const handleRegistrationComplete = () => {
    console.log('Registration completed successfully, closing dialog');
    onOpenChange(false);
    setTimeout(() => {
      toast.success('تم التسجيل بنجاح');
    }, 100);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log('Dialog onOpenChange triggered:', { newOpen, currentOpen: open });
        if (!newOpen) {
          console.log('Closing dialog');
          onOpenChange(false);
        } else {
          onOpenChange(newOpen);
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          console.log('Preventing pointer down outside');
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          console.log('Preventing escape key');
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          console.log('Preventing interaction outside');
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل الحضور في {event.title}</DialogTitle>
        </DialogHeader>
        {status !== 'available' ? (
          <RegistrationStatusAlert status={status} />
        ) : (
          <RegistrationForm
            eventTitle={event.title}
            eventPrice={event.price}
            eventDate={event.date}
            eventTime={event.time}
            eventLocation={event.location}
            onSubmit={handleRegistrationComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};