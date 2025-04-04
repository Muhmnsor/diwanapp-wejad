
// src/components/events/reports/EventReportDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventReportForm } from "./EventReportForm";

export interface EventReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  initialData?: any; // Add this property
  mode?: string;    // Add this property
}

export const EventReportDialog = ({
  isOpen,
  onClose,
  eventId,
  initialData,
  mode = "create"
}: EventReportDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "تعديل التقرير" : "إضافة تقرير جديد"}</DialogTitle>
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
