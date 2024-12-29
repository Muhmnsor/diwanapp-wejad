import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "../../events/EditProjectEventHeader";
import { EditActivityForm } from "../form/EditActivityForm";

interface EditActivityDialogProps {
  activity: {
    id: string;
    project_id: string;
    event: ProjectActivity;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  projectId: string;
}

export const EditActivityDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSave,
  projectId
}: EditActivityDialogProps) => {
  console.log('Activity data in EditActivityDialog:', activity);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]" dir="rtl">
        <EditProjectEventHeader />
        <ScrollArea className="h-[calc(90vh-120px)]">
          <EditActivityForm
            activity={activity}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
            projectId={projectId}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};