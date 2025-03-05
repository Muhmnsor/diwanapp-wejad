
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from "../types/task";
import { Separator } from "@/components/ui/separator";
import { TaskDiscussionHeader } from "./discussions/TaskDiscussionHeader";
import { TaskDiscussionContent } from "./discussions/TaskDiscussionContent";
import { TaskCommentForm } from "./discussions/TaskCommentForm";
import { useTaskMetadataAttachments } from "../hooks/useTaskMetadataAttachments";
import { AttachmentsByCategory } from "./metadata/AttachmentsByCategory";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { TaskComment } from "../types/taskComment";

interface TaskDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const TaskDiscussionDialog = ({ open, onOpenChange, task }: TaskDiscussionDialogProps) => {
  const [newComment, setNewComment] = useState<TaskComment | undefined>(undefined);

  const {
    loading,
    creatorAttachments,
    assigneeAttachments,
    deliverables,
    loadingDeliverables,
    handleDownload,
    refreshAttachments
  } = useTaskMetadataAttachments(task.id || undefined);

  // سجلات التحقق عند الفتح
  useEffect(() => {
    if (task.id && open) {
      console.log("Dialog opened for Task ID:", task.id);
      console.log("Task data:", task);
      console.log("Creator Attachments:", creatorAttachments);
      console.log("Assignee Attachments:", assigneeAttachments);
      console.log("Deliverables:", deliverables);
    }
  }, [task.id, creatorAttachments, assigneeAttachments, deliverables, open]);

  const handleCommentAdded = (newComment?: TaskComment) => {
    // إذا تم تمرير تعليق جديد، نقوم بتحديث الحالة
    if (newComment) {
      setNewComment(newComment);
    }
  };

  const handleRefreshDeliverables = () => {
    console.log("Refreshing deliverables for task:", task.id);
    refreshAttachments();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <TaskDiscussionHeader task={task} />
        
        <Separator className="my-4" />
        
        {/* قسم المستلمات */}
        {deliverables && deliverables.length > 0 && (
          <div className="mb-4">
            <AttachmentsByCategory
              title="مستلمات المهمة:"
              attachments={deliverables}
              bgColor="bg-amber-50"
              iconColor="text-amber-500"
              onDownload={handleDownload}
            />
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 mb-4">
          {/* تمرير التعليق الجديد لتحديث القائمة */}
          <TaskDiscussionContent task={task} newComment={newComment} />
        </div>
        
        <div className="mt-auto">
          <TaskCommentForm task={task} onCommentAdded={handleCommentAdded} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
