import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationForm } from "./RegistrationForm";

interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  eventPrice: number | "free";
}

export const EventRegistrationDialog = ({
  open,
  onOpenChange,
  eventTitle,
  eventPrice,
}: EventRegistrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل الحضور في {eventTitle}</DialogTitle>
        </DialogHeader>
        <RegistrationForm
          eventTitle={eventTitle}
          eventPrice={eventPrice}
          onSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};