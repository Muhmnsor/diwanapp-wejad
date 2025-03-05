
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
          <h3 className="text-sm font-medium mb-2">مستلمات المهمة:</h3>
          {loadingDeliverables ? (
            <div className="text-sm text-gray-500">جاري تحميل المستلمات...</div>
          ) : hasDeliverables ? (
            <div className="space-y-2">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center bg-purple-50 rounded p-1.5 text-sm">
                  <span className="h-4 w-4 text-purple-500 ml-2 flex-shrink-0">📁</span>
                  <span className="flex-1 truncate">{deliverable.file_name}</span>
                  <div className="mr-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      deliverable.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      deliverable.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deliverable.status === 'approved' ? 'تم القبول' : 
                       deliverable.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </div>
                  <button 
                    className="h-6 w-6 p-0 text-gray-500 hover:text-blue-500"
                    onClick={() => handleDownload(deliverable.file_url, deliverable.file_name)}
                    title="تنزيل الملف"
                  >
                    <span className="text-xs">⬇️</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 text-sm text-gray-500">لا توجد مستلمات للمهمة</div>
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
