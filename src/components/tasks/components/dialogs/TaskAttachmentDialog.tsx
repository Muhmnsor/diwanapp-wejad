
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../../types/task";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAttachmentOperations, Attachment } from "../../hooks/useAttachmentOperations";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AttachmentsByCategory } from "../metadata/AttachmentsByCategory";
import { useAuthStore } from "@/store/authStore";
interface TaskAttachmentDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const TaskAttachmentDialog = ({
  task,
  open,
  onOpenChange
}: TaskAttachmentDialogProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    user
  } = useAuthStore();
  const {
    handleDownloadAttachment,
    deleteAttachment,
    isDeleting,
    uploadAttachment,
    isUploading
  } = useAttachmentOperations(() => {
    // Reload attachments after deletion
    fetchAttachments();
  }, () => {
    // Reload attachments after upload
    fetchAttachments();
  });
  const fetchAttachments = async () => {
    if (!task?.id) return;
    setIsLoading(true);
    try {
      // Determine which table the task belongs to
      let taskTable = 'tasks';
      if (task.is_subtask) {
        taskTable = 'subtasks';
      } else if (task.workspace_id) {
        taskTable = 'portfolio_tasks';
      }
      console.log('Fetching attachments for task:', task.id, 'from table:', taskTable);
      const {
        data,
        error
      } = await supabase.from('unified_task_attachments').select('*').eq('task_id', task.id).eq('task_table', taskTable).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching attachments:', error);
        return;
      }
      console.log('Fetched attachments:', data);
      setAttachments(data || []);
    } catch (error) {
      console.error('Error in fetchAttachments:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (open && task) {
      fetchAttachments();
    }
  }, [open, task]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile || !task.id) return;

    // Determine which table the task belongs to
    let taskTable = 'tasks';
    if (task.is_subtask) {
      taskTable = 'subtasks';
    } else if (task.workspace_id) {
      taskTable = 'portfolio_tasks';
    }
    const success = await uploadAttachment(selectedFile, task.id, 'general',
    // Default category
    taskTable);
    if (success) {
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      // No need to call fetchAttachments as it's handled by the callback
    }
  };

  // Group attachments by category
  const creatorAttachments = attachments.filter(att => att.attachment_category === 'creator' || !att.attachment_category);
  const assigneeAttachments = attachments.filter(att => att.attachment_category === 'assignee');
  const commentAttachments = attachments.filter(att => att.attachment_category === 'comment');
  const generalAttachments = attachments.filter(att => att.attachment_category === 'general');

  // Check if user can delete attachments
  const canDeleteAttachment = (attachment: Attachment) => {
    return user?.id === attachment.created_by || user?.isAdmin || user?.role === 'admin';
  };
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl"> مستلمات المهمة</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              {/* Upload button removed from here */}
            </div>

            {isLoading ? <div className="text-center py-4">جاري تحميل المرفقات...</div> : attachments.length === 0 ? <div className="text-center py-4 text-gray-500">لا توجد مرفقات لهذه المهمة</div> : <div className="space-y-4">
                <AttachmentsByCategory title="مرفقات المهمة" attachments={creatorAttachments} bgColor="bg-blue-50" iconColor="text-blue-500" onDownload={handleDownloadAttachment} onDelete={deleteAttachment} isDeleting={isDeleting} canDelete={true} />
                
                <AttachmentsByCategory title="مرفقات من المكلف بالمهمة" attachments={assigneeAttachments} bgColor="bg-green-50" iconColor="text-green-500" onDownload={handleDownloadAttachment} onDelete={deleteAttachment} isDeleting={isDeleting} canDelete={true} />
                
                <AttachmentsByCategory title="مرفقات في التعليقات" attachments={commentAttachments} bgColor="bg-purple-50" iconColor="text-purple-500" onDownload={handleDownloadAttachment} onDelete={deleteAttachment} isDeleting={isDeleting} canDelete={true} />
                
                <AttachmentsByCategory title="مرفقات أخرى" attachments={generalAttachments} bgColor="bg-gray-50" iconColor="text-gray-500" onDownload={handleDownloadAttachment} onDelete={deleteAttachment} isDeleting={isDeleting} canDelete={true} />
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* File upload dialog */}
      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isUploadDialogOpen ? '' : 'hidden'}`}>
        <div className="bg-white p-4 rounded-md w-96 max-w-full" dir="rtl">
          <h3 className="text-lg font-medium mb-4">رفع ملف للمهمة</h3>
          <p className="text-sm text-gray-500 mb-4">يمكنك رفع ملف واحد في كل مرة</p>
          
          <div className="space-y-4">
            <div>
              <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" />
            </div>
            
            {selectedFile && <div className="text-sm bg-gray-50 p-2 rounded">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>}
            
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button variant="outline" size="sm" onClick={() => {
              setIsUploadDialogOpen(false);
              setSelectedFile(null);
            }}>
                إلغاء
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>;
};
