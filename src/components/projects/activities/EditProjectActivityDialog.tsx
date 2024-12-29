import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Event } from "@/types/event";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectActivityHeader } from "./EditProjectActivityHeader";
import { EditProjectActivityFormContainer } from "./form/EditProjectActivityFormContainer";

interface EditProjectActivityDialogProps {
  activity: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedActivity: Event) => void;
  projectId: string;
}

export const EditProjectActivityDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditProjectActivityDialogProps) => {
  console.log('Activity data in EditProjectActivityDialog:', activity);

  const handleSave = async (updatedActivity: Event) => {
    await onSave(updatedActivity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditProjectActivityHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <EditProjectActivityFormContainer
              activity={activity}
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