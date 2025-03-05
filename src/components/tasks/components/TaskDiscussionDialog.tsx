
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
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-blue-800">مستلمات المهمة</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefreshDeliverables} 
                className="h-7 px-2"
              >
                <RefreshCcw className="h-3.5 w-3.5 ml-1" />
                تحديث
              </Button>
            </div>
            
            <div className="border p-3 rounded-md bg-blue-50 mb-3">
              <div className="space-y-2">
                {loadingDeliverables ? (
                  <div className="text-center py-2 text-sm text-gray-500">جاري تحميل المستلمات...</div>
                ) : (
                  <div>
                    {deliverables.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center bg-white rounded p-2 text-sm">
                        <span className="flex-1 truncate">{deliverable.file_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(deliverable.file_url, deliverable.file_name)}
                        >
                          <span className="sr-only">تنزيل</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
