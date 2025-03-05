
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
    deliverables,
    loadingDeliverables,
    handleDownload,
    refreshAttachments
  } = useTaskMetadataAttachments(task.id || undefined);

  // إضافة سجل للتحقق من المستلمات
  useEffect(() => {
    console.log("Task ID:", task.id);
    console.log("Deliverables:", deliverables);
  }, [task.id, deliverables]);

  const handleCommentAdded = () => {
    // ترقيم مفتاح التحديث لإعادة تحميل المحتوى
    setRefreshKey(prev => prev + 1);
    // تحديث المستلمات عند إضافة تعليق جديد
    refreshAttachments();
  };

  // التحقق من وجود مستلمات
  const hasDeliverables = deliverables && deliverables.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <TaskDiscussionHeader task={task} />
        
        <Separator className="my-4" />
        
        {/* قسم المستلمات (يظهر بين معلومات المهمة ومساحة النقاش) */}
        <div className="mb-4">
          {loadingDeliverables ? (
            <div className="text-sm text-gray-500">جاري تحميل المستلمات...</div>
          ) : (
            <AttachmentsByCategory
              title="مستلمات المهمة:"
              attachments={deliverables.map(deliverable => ({
                id: deliverable.id,
                file_name: deliverable.file_name,
                file_url: deliverable.file_url,
                file_type: deliverable.file_type,
                status: deliverable.status // إضافة حالة المستلم
              }))}
              bgColor="bg-purple-50"
              iconColor="text-purple-500"
              onDownload={handleDownload}
              showStatus={true} // إضافة خاصية جديدة لإظهار حالة المستلم
            />
          )}
        </div>
        
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
