import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحضير جماعي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button
            onClick={() => {
              onGroupAction('present');
              onOpenChange(false);
            }}
            className="w-full"
          >
            تحضير الجميع
          </Button>
          <Button
            onClick={() => {
              onGroupAction('absent');
              onOpenChange(false);
            }}
            variant="destructive"
            className="w-full"
          >
            تغييب الجميع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};