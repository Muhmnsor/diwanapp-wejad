import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivityFormData } from "@/components/projects/activities/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "./EditProjectEventHeader";
import { EditProjectEventFormContainer } from "./form/EditProjectEventFormContainer";

interface EditProjectEventDialogProps {
  event: ProjectActivityFormData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedEvent: ProjectActivityFormData) => void;
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

  const handleSave = async (updatedEvent: ProjectActivityFormData) => {
    await onSave(updatedEvent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditProjectEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <EditProjectEventFormContainer
              event={event}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              projectId={projectId}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};