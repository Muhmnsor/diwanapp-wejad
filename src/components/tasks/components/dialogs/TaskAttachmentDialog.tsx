
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../../types/task";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAttachmentOperations, Attachment } from "../../hooks/useAttachmentOperations";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { AttachmentsByCategory } from "../metadata/AttachmentsByCategory";
import { useAuthStore } from "@/store/authStore";
import { useTaskMetadataAttachments } from "../../hooks/useTaskMetadataAttachments";

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
  const { user } = useAuthStore();
  
  const {
    deliverables,
    loadingDeliverables,
    refreshAttachments: refreshDeliverables
  } = useTaskMetadataAttachments(task?.id);
  
  const {
    handleDownloadAttachment,
    deleteAttachment,
    isDeleting,
    uploadAttachment,
    isUploading
  } = useAttachmentOperations(() => {
    fetchAttachments();
    refreshDeliverables();
  }, () => {
    fetchAttachments();
    refreshDeliverables();
  });

  const fetchAttachments = async () => {
    if (!task?.id) return;
    setIsLoading(true);
    try {
      let taskTable = 'tasks';
      if (task.is_subtask) {
        taskTable = 'subtasks';
      } else if (task.workspace_id) {
        taskTable = 'portfolio_tasks';
      }
      
      console.log('Fetching attachments for task:', task.id, 'from table:', taskTable);
      
      const { data, error } = await supabase
        .from('unified_task_attachments')
        .select('*')
        .eq('task_id', task.id)
        .eq('task_table', taskTable)
        .order('created_at', { ascending: false });
        
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
      refreshDeliverables();
    }
  }, [open, task]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !task.id) return;
    
    let taskTable = 'tasks';
    if (task.is_subtask) {
      taskTable = 'subtasks';
    } else if (task.workspace_id) {
      taskTable = 'portfolio_tasks';
    }
    
    const success = await uploadAttachment(selectedFile, task.id, 'general', taskTable);
    
    if (success) {
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
    }
  };

  const creatorAttachments = attachments.filter(att => att.attachment_category === 'creator' || !att.attachment_category);
  const assigneeAttachments = attachments.filter(att => att.attachment_category === 'assignee');
  const commentAttachments = attachments.filter(att => att.attachment_category === 'comment');
  const generalAttachments = attachments.filter(att => att.attachment_category === 'general');
  
  // Format deliverables to match the attachment structure
  const formattedDeliverables = deliverables.map(del => ({
    id: del.id,
    file_name: del.file_name,
    file_url: del.file_url,
    created_at: del.created_at,
    file_type: del.file_type || null
  }));

  const canDeleteAttachment = (attachment: Attachment) => {
    return user?.id === attachment.created_by || user?.isAdmin || user?.role === 'admin';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader className="py-0 my-0">
            <DialogTitle className="text-xl py-0 my-0">مستلمات المهمة</DialogTitle>
          </DialogHeader>

          <div className="py-0 px-0 my-[3px]">
            <div className="flex justify-between items-center mb-4 my-0">
              <h3 className="text-lg font-semibold">{task.title}</h3>
            </div>

            {isLoading && loadingDeliverables ? 
              <div className="text-center py-4">جاري تحميل المستلمات...</div> 
            : (attachments.length === 0 && formattedDeliverables.length === 0) ? 
              <div className="text-center py-4 text-gray-500">لا توجد مستلمات لهذه المهمة</div> 
            : 
              <div className="space-y-4">
                {/* مستلمات المهمة المرفوعة من خلال زر "رفع مستلمات" */}
                {formattedDeliverables.length > 0 && (
                  <div className="border p-3 rounded-md bg-blue-50">
                    <h4 className="font-medium text-blue-800 mb-2">مستلمات المهمة</h4>
                    <div className="space-y-2">
                      {formattedDeliverables.map((deliverable) => (
                        <div key={deliverable.id} className="flex items-center bg-white rounded p-2 text-sm">
                          <span className="flex-1 truncate">{deliverable.file_name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDownloadAttachment(deliverable.file_url, deliverable.file_name)}
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
                  </div>
                )}

                <AttachmentsByCategory 
                  title="مستلمات المهمة" 
                  attachments={creatorAttachments} 
                  bgColor="bg-blue-50" 
                  iconColor="text-blue-500" 
                  onDownload={handleDownloadAttachment} 
                  onDelete={deleteAttachment} 
                  isDeleting={isDeleting} 
                  canDelete={true} 
                />
                
                <AttachmentsByCategory 
                  title="مستلمات من المكلف بالمهمة" 
                  attachments={assigneeAttachments} 
                  bgColor="bg-green-50" 
                  iconColor="text-green-500" 
                  onDownload={handleDownloadAttachment} 
                  onDelete={deleteAttachment} 
                  isDeleting={isDeleting} 
                  canDelete={true} 
                />
                
                <AttachmentsByCategory 
                  title="مستلمات في التعليقات" 
                  attachments={commentAttachments} 
                  bgColor="bg-purple-50" 
                  iconColor="text-purple-500" 
                  onDownload={handleDownloadAttachment} 
                  onDelete={deleteAttachment} 
                  isDeleting={isDeleting} 
                  canDelete={true} 
                />
                
                <AttachmentsByCategory 
                  title="مستلمات أخرى" 
                  attachments={generalAttachments} 
                  bgColor="bg-gray-50" 
                  iconColor="text-gray-500" 
                  onDownload={handleDownloadAttachment} 
                  onDelete={deleteAttachment} 
                  isDeleting={isDeleting} 
                  canDelete={true} 
                />
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>

      <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isUploadDialogOpen ? '' : 'hidden'}`}>
        <div className="bg-white p-4 rounded-md w-96 max-w-full" dir="rtl">
          <h3 className="text-lg font-medium mb-4">رفع ملف للمهمة</h3>
          <p className="text-sm text-gray-500 mb-4">يمكنك رفع ملف واحد في كل مرة</p>
          
          <div className="space-y-4">
            <div>
              <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" />
            </div>
            
            {selectedFile && (
              <div className="text-sm bg-gray-50 p-2 rounded">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}
            
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setSelectedFile(null);
                }}
              >
                إلغاء
              </Button>
              <Button 
                size="sm" 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
