
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { MeetingTask } from "@/types/meeting";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";

interface DeleteTaskDialogProps {
  task: MeetingTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  task,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [deleteGeneralTask, setDeleteGeneralTask] = useState(true);
  const { mutate: deleteTask, isPending } = useDeleteMeetingTask();

  const handleDelete = () => {
    deleteTask(
      {
        id: task.id,
        meeting_id: task.meeting_id,
        general_task_id: task.general_task_id || undefined,
        deleteGeneralTask: task.general_task_id ? deleteGeneralTask : false,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>حذف المهمة</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            هل أنت متأكد من رغبتك في حذف المهمة التالية؟
          </p>
          <p className="font-semibold text-lg">{task.title}</p>
          
          {task.general_task_id && (
            <div className="mt-4 flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="deleteGeneralTask" 
                checked={deleteGeneralTask}
                onCheckedChange={(checked) => setDeleteGeneralTask(!!checked)}
              />
              <Label 
                htmlFor="deleteGeneralTask" 
                className="text-sm cursor-pointer"
              >
                حذف المهمة المرتبطة في المهام العامة أيضاً
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              "حذف"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
