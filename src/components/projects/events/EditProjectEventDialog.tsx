import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "./EditProjectEventHeader";
import { EditProjectEventFormContainer } from "./form/EditProjectEventFormContainer";

interface EditProjectEventDialogProps {
  activity: ProjectActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedActivity: ProjectActivity) => void;
  projectId: string;
}

export const EditProjectEventDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditProjectEventDialogProps) => {
  console.log('Activity data in EditProjectEventDialog:', activity);

  const handleSave = async (updatedActivity: ProjectActivity) => {
    await onSave(updatedActivity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] [&_[data-radix-scroll-area-viewport]]:!pl-4 [&_[data-radix-scroll-area-viewport]]:!pr-0" dir="rtl">
        <EditProjectEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            <EditProjectEventFormContainer
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