
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
        
        {/* قسم المستلمات مع زر تحديث */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">مستلمات المهمة:</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={handleRefreshDeliverables}
              title="تحديث المستلمات"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {loadingDeliverables ? (
            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded flex items-center justify-center">
              <span className="h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
              جاري تحميل المستلمات...
            </div>
          ) : deliverables && deliverables.length > 0 ? (
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
            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
              لا توجد مستلمات للمهمة - يمكنك رفع المستلمات عبر زر "المرفقات" في صفحة المهام
            </div>
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
