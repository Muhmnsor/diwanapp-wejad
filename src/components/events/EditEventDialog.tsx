import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Event } from "@/types/event";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditEventHeader } from "./EditEventHeader";
import { EditEventFormContainer } from "./form/EditEventFormContainer";

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: Event) => void;
}

export const EditEventDialog = ({ 
  event, 
  open, 
  onOpenChange, 
  onSave 
}: EditEventDialogProps) => {
  console.log('Event data in EditEventDialog:', event);

  const handleSave = async (updatedEvent: Event) => {
    await onSave(updatedEvent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <EditEventFormContainer
            eventId={event.id}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
