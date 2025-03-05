
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Task } from "../types/task";
import { Separator } from "@/components/ui/separator";
import { TaskDiscussionHeader } from "./discussions/TaskDiscussionHeader";
import { TaskDiscussionContent } from "./discussions/TaskDiscussionContent";
import { TaskCommentForm } from "./discussions/TaskCommentForm";
import { useFetchTaskAttachments } from "../project-details/components/task-item/useFetchTaskAttachments";
import { AttachmentsByCategory } from "./metadata/AttachmentsByCategory";
import { useTaskMetadataAttachments } from "../hooks/useTaskMetadataAttachments";
import { Paperclip } from "lucide-react";

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
  
  // استخدام هوك لجلب جميع المستلمات المرتبطة بالمهمة
  const { 
    creatorAttachments,
    assigneeAttachments,
    commentAttachments,
    loading,
    handleDownload: downloadAttachment
  } = useTaskMetadataAttachments(task.id);

  const handleCommentAdded = () => {
    // ترقيم مفتاح التحديث لإعادة تحميل المحتوى
    setRefreshKey(prev => prev + 1);
  };
  
  // التحقق من وجود مستلمات
  const hasAttachments = assigneeAttachments.length > 0 || creatorAttachments.length > 0 || commentAttachments.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <TaskDiscussionHeader task={task} />
        
        {assigneeAttachment && (
          <div className="mt-2 mb-1">
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
              compactLayout={true}
            />
          </div>
        )}
        
        {/* قسم جديد لعرض جميع المستلمات المرتبطة بالمهمة */}
        {hasAttachments && (
          <div className="mt-2 mb-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">المستلمات المرتبطة بالمهمة</h3>
            </div>
            
            <div className="space-y-2">
              {creatorAttachments.length > 0 && (
                <AttachmentsByCategory
                  title="مستلمات منشئ المهمة:"
                  attachments={creatorAttachments}
                  bgColor="bg-green-50"
                  iconColor="text-green-600"
                  onDownload={downloadAttachment}
                  compactLayout={true}
                />
              )}
              
              {assigneeAttachments.length > 0 && (
                <AttachmentsByCategory
                  title="مستلمات المكلف بالمهمة:"
                  attachments={assigneeAttachments}
                  bgColor="bg-blue-50"
                  iconColor="text-blue-600"
                  onDownload={downloadAttachment}
                  compactLayout={true}
                />
              )}
              
              {commentAttachments.length > 0 && (
                <AttachmentsByCategory
                  title="مستلمات التعليقات:"
                  attachments={commentAttachments}
                  bgColor="bg-gray-50"
                  iconColor="text-gray-500"
                  onDownload={downloadAttachment}
                  compactLayout={true}
                />
              )}
            </div>
          </div>
        )}
        
        <Separator className="my-3" />
        
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
