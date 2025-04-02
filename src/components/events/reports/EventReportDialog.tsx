
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventReportForm } from "./EventReportForm";
import { EventReportFormValues } from "./types";

interface EventReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  initialData?: EventReportFormValues & { id: string };
  mode?: 'create' | 'edit';
}

export const EventReportDialog = ({
  isOpen,
  onClose,
  eventId,
  initialData,
  mode = 'create'
}: EventReportDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'إضافة تقرير جديد' : 'تعديل التقرير'}</DialogTitle>
        </DialogHeader>
        <EventReportForm 
          eventId={eventId} 
          onClose={onClose} 
          initialData={initialData}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};
