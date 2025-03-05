
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

interface TaskDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const TaskDiscussionDialog = ({ open, onOpenChange, task }: TaskDiscussionDialogProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleCommentAdded = () => {
    // ترقيم مفتاح التحديث لإعادة تحميل المحتوى
    setRefreshKey(prev => prev + 1);
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
        
        {/* تم إخفاء قسم المستلمات */}
        
        <div className="overflow-y-auto flex-1 pr-1 -mr-1 mb-4">
          {/* استخدام refreshKey كمفتاح لإعادة تحميل المحتوى عند إضافة تعليق جديد */}
          <TaskDiscussionContent key={refreshKey} task={task} />
        </div>
        
        <div className="mt-auto">
          <TaskCommentForm task={task} onCommentAdded={handleCommentAdded} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
