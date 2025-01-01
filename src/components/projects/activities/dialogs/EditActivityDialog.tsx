import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ProjectActivity } from "@/types/activity";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditProjectEventHeader } from "../../events/EditProjectEventHeader";
import { EditActivityForm } from "../form/EditActivityForm";
import { Separator } from "@/components/ui/separator";

interface EditActivityDialogProps {
  activity: ProjectActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
  projectId: string;
}

export const EditActivityDialog = ({ 
  activity, 
  open, 
  onOpenChange,
  onSuccess,
  projectId
}: EditActivityDialogProps) => {
  console.log('EditActivityDialog - Received activity:', activity);
  
  const formData = activity ? {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    date: activity.date,
    time: activity.time,
    location: activity.location,
    location_url: activity.location_url,
    special_requirements: activity.special_requirements,
    event_hours: activity.event_hours
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] space-y-4 text-right" dir="rtl">
        <EditProjectEventHeader />
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(90vh-120px)] pl-4">
          <EditActivityForm
            activity={formData}
            projectId={projectId}
            onSuccess={() => {
              onSuccess();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};