import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventReportForm } from "./EventReportForm";

interface EventReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
}

export const EventReportDialog = ({
  open,
  onOpenChange,
  eventId,
}: EventReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة تقرير الفعالية</DialogTitle>
        </DialogHeader>
        <EventReportForm 
          eventId={eventId} 
          onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};