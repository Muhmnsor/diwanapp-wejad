
import { useState, useEffect } from "react";
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

  // إضافة سجل للتحقق من المرفقات
  useEffect(() => {
    console.log("Task ID:", task.id);
    console.log("Creator Attachments:", creatorAttachments);
    console.log("Assignee Attachments:", assigneeAttachments);
  }, [task.id, creatorAttachments, assigneeAttachments]);

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
        
        <Separator className="my-4" />
        
        {/* قسم المستلمات (يظهر بين معلومات المهمة ومساحة النقاش) */}
        {hasAttachments ? (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">مرفقات المهمة:</h3>
            <div className="space-y-2">
              {creatorAttachments.length > 0 && (
                <AttachmentsByCategory
                  title="مرفقات منشئ المهمة:"
                  attachments={creatorAttachments}
                  bgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  onDownload={handleDownload}
                />
              )}

              {assigneeAttachments.length > 0 && (
                <AttachmentsByCategory
                  title="مرفقات المكلف بالمهمة:"
                  attachments={assigneeAttachments}
                  bgColor="bg-green-50"
                  iconColor="text-green-500"
                  onDownload={handleDownload}
                />
              )}
            </div>
          </div>
        ) : loading ? (
          <div className="mb-4 text-sm text-gray-500">جاري تحميل المرفقات...</div>
        ) : (
          <div className="mb-4 text-sm text-gray-500">لا توجد مرفقات للمهمة</div>
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
