
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from "../types/task";
import { Separator } from "@/components/ui/separator";
import { TaskDiscussionHeader } from "./discussions/TaskDiscussionHeader";
import { TaskDiscussionContent } from "./discussions/TaskDiscussionContent";
import { TaskCommentForm } from "./discussions/TaskCommentForm";
import { useTaskMetadataAttachments } from "../hooks/useTaskMetadataAttachments";
import { AttachmentsByCategory } from "./metadata/AttachmentsByCategory";

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
    handleDownload
  } = useTaskMetadataAttachments(task.id || undefined);

  const handleCommentAdded = () => {
    // ترقيم مفتاح التحديث لإعادة تحميل المحتوى
    setRefreshKey(prev => prev + 1);
  };

  // التحقق من وجود مرفقات
  const hasAttachments = creatorAttachments.length > 0 || assigneeAttachments.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <TaskDiscussionHeader task={task} />
        
        {hasAttachments && (
          <>
            <div className="mt-2">
              <h3 className="text-sm font-medium mb-2">مرفقات المهمة:</h3>
              <div className="space-y-2">
                <AttachmentsByCategory
                  title="مرفقات منشئ المهمة:"
                  attachments={creatorAttachments}
                  bgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  onDownload={handleDownload}
                />

                <AttachmentsByCategory
                  title="مرفقات المكلف بالمهمة:"
                  attachments={assigneeAttachments}
                  bgColor="bg-green-50"
                  iconColor="text-green-500"
                  onDownload={handleDownload}
                />
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}
        
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
