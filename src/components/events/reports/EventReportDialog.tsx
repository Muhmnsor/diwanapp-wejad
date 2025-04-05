
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventReportForm } from "./EventReportForm";

interface EventReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

export const EventReportDialog = ({
  isOpen,
  onClose,
  eventId,
}: EventReportDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة تقرير جديد</DialogTitle>
        </DialogHeader>
        <EventReportForm eventId={eventId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
