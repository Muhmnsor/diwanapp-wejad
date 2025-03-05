
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function useAttachmentOperations(onDeleteCallback?: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAttachment = async (id: string, tableName: string = 'unified_task_attachments') => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        if (tableName === 'unified_task_attachments') {
          // Try with the fallback table
          return handleDeleteAttachment(id, 'task_attachments');
        }
        throw error;
      }
      
      toast.success('تم حذف المرفق بنجاح');
      
      if (onDeleteCallback) {
        onDeleteCallback();
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('فشل حذف المرفق');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    handleDeleteAttachment,
    isDeleting
  };
}
