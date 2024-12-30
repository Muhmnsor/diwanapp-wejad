import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX } from "lucide-react";

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupAction: (status: 'present' | 'absent') => void;
}

export const GroupDialog: FC<GroupDialogProps> = ({
  open,
  onOpenChange,
  onGroupAction,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تحضير جماعي</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-4 py-4">
          <Button
            onClick={() => {
              onGroupAction('present');
              onOpenChange(false);
            }}
            className="flex-1"
          >
            <UserCheck className="h-4 w-4 ml-2" />
            تحضير الجميع
          </Button>
          <Button
            onClick={() => {
              onGroupAction('absent');
              onOpenChange(false);
            }}
            variant="destructive"
            className="flex-1"
          >
            <UserX className="h-4 w-4 ml-2" />
            تغييب الجميع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};