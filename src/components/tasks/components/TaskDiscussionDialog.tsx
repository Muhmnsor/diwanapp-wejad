
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from "../types/task";
import { Separator } from "@/components/ui/separator";
import { TaskDiscussionHeader } from "./discussions/TaskDiscussionHeader";
import { TaskDiscussionContent } from "./discussions/TaskDiscussionContent";
import { TaskCommentForm } from "./discussions/TaskCommentForm";
import { useFetchTaskAttachments } from "../project-details/components/task-item/useFetchTaskAttachments";
import { AttachmentsByCategory } from "./metadata/AttachmentsByCategory";

interface TaskDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const TaskDiscussionDialog = ({ open, onOpenChange, task }: TaskDiscussionDialogProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { assigneeAttachment, handleDownload } = useFetchTaskAttachments(
    task.id, 
    task.assigned_to
  );

  const handleCommentAdded = () => {
    // ترقيم مفتاح التحديث لإعادة تحميل المحتوى
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <TaskDiscussionHeader task={task} />
        
        {assigneeAttachment && (
          <div className="mt-3">
            <AttachmentsByCategory
              title="مرفق المكلف بالمهمة:"
              attachments={[{
                id: assigneeAttachment.id,
                file_name: assigneeAttachment.file_name,
                file_url: assigneeAttachment.file_url
              }]}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
              onDownload={handleDownload}
            />
          </div>
        )}
        
        <Separator className="my-4" />
        
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
