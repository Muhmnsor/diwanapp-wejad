
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventReportForm } from "../EventReportForm";
import { EventReportFormValues } from "../types";

interface EventReportEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  reportData: EventReportFormValues & { id: string };
}

export const EventReportEditDialog = ({ 
  isOpen, 
  onClose, 
  eventId,
  reportData 
}: EventReportEditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل التقرير</DialogTitle>
        </DialogHeader>
        <EventReportForm 
          eventId={eventId} 
          onClose={onClose}
          initialData={reportData}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
};
