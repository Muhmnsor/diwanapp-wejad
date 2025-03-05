
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteAttachment } from '../services/uploadService';

export interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  attachment_category: string;
  created_by: string | null;
  created_at: string;
}

export const useAttachmentOperations = (onDeleteSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [attachmentId]: true }));
      
      await deleteAttachment(attachmentId);
      
      toast.success('تم حذف المرفق بنجاح');
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('حدث خطأ أثناء حذف المرفق');
      return false;
    } finally {
      setIsDeleting(prev => ({ ...prev, [attachmentId]: false }));
    }
  };

  const handleDownloadAttachment = (fileUrl: string, fileName: string) => {
    try {
      // فتح الملف في نافذة جديدة
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('حدث خطأ أثناء تنزيل المرفق');
    }
  };

  return {
    isDeleting,
    handleDeleteAttachment,
    handleDownloadAttachment
  };
};
