import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditActivityForm } from "../form/EditActivityForm";
import { EditProjectEventHeader } from "../../events/EditProjectEventHeader";
import { Separator } from "@/components/ui/separator";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void>;
  projectId: string;
}

export const AddActivityDialog = ({ 
  open, 
  onOpenChange,
  onSuccess,
  projectId
}: AddActivityDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] space-y-4 text-right" dir="rtl">
        <EditProjectEventHeader />
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(90vh-120px)] pl-4">
          <EditActivityForm
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