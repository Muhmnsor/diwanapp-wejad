import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Event } from "@/store/eventStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "./EditProjectEventHeader";
import { EditProjectEventFormContainer } from "./form/EditProjectEventFormContainer";

interface EditProjectEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: Event) => void;
  projectId: string;
}

export const EditProjectEventDialog = ({ 
  event, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditProjectEventDialogProps) => {
  console.log('Event data in EditProjectEventDialog:', event);

  const handleSave = async (updatedEvent: Event) => {
    await onSave(updatedEvent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditProjectEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <EditProjectEventFormContainer
            event={event}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
            projectId={projectId}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};