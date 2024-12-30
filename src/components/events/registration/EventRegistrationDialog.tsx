import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventRegistrationForm } from "./EventRegistrationForm";

interface EventRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  maxAttendees: number;
}

export const EventRegistrationDialog = ({
  isOpen,
  onClose,
  eventId,
  maxAttendees,
}: EventRegistrationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في الفعالية</DialogTitle>
        </DialogHeader>
        <EventRegistrationForm
          eventId={eventId}
          maxAttendees={maxAttendees}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};