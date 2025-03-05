
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store/authStore';

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

export const useAttachmentOperations = (onDeleteSuccess?: () => void, onUploadSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuthStore();

  // وظيفة رفع مستلم المهمة 
  const uploadDeliverable = async (
    file: File, 
    taskId: string,
    taskTable: string = 'tasks'
  ) => {
    try {
      console.log('Starting deliverable upload process for task:', taskId);
      setIsUploading(true);
      
      // توليد اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${taskId}/deliverables/${fileName}`;
      
      // رفع الملف للتخزين
      console.log('Uploading deliverable to storage:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`خطأ في رفع المستلم: ${uploadError.message}`);
      }
      
      if (!uploadData) {
        throw new Error('فشل في رفع المستلم: لم يتم استلام بيانات التحميل');
      }
      
      console.log('Deliverable uploaded successfully:', uploadData.path);
      
      // الحصول على الرابط العام للملف
      const { data: publicUrlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('فشل في الحصول على الرابط العام للمستلم');
      }
      
      const fileUrl = publicUrlData.publicUrl;
      console.log('Deliverable public URL:', fileUrl);
      
      // حفظ مرجع الملف في قاعدة البيانات في جدول task_deliverables
      console.log('Saving deliverable reference to database, task_id:', taskId, 'file_url:', fileUrl);
      const { error: dbError } = await supabase
        .from('task_deliverables')
        .insert({
          task_id: taskId,
          task_table: taskTable,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          created_by: user?.id || null,
          status: 'pending'
        });
        
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`خطأ في حفظ بيانات المستلم: ${dbError.message}`);
      }
      
      toast.success('تم رفع المستلم بنجاح');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error in uploadDeliverable:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع المستلم');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Function to upload attachment
  const uploadAttachment = async (
    file: File, 
    taskId: string, 
    category: string = 'general',
    taskTable: string = 'tasks'
  ) => {
    try {
      console.log('Starting file upload process for task:', taskId);
      setIsUploading(true);
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${taskId}/${fileName}`;
      
      // Upload file to storage
      console.log('Uploading file to storage:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`خطأ في رفع الملف: ${uploadError.message}`);
      }
      
      if (!uploadData) {
        throw new Error('فشل في رفع الملف: لم يتم استلام بيانات التحميل');
      }
      
      console.log('File uploaded successfully:', uploadData.path);
      
      // Get public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath);
        
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('فشل في الحصول على الرابط العام للملف');
      }
      
      const fileUrl = publicUrlData.publicUrl;
      console.log('File public URL:', fileUrl);
      
      // Save file reference to database in unified_task_attachments table
      console.log('Saving attachment reference to database, task_id:', taskId, 'file_url:', fileUrl);
      const { error: dbError } = await supabase
        .from('unified_task_attachments')
        .insert({
          task_id: taskId,
          task_table: taskTable,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          attachment_category: category,
          created_by: user?.id || null
        });
        
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`خطأ في حفظ بيانات الملف: ${dbError.message}`);
      }
      
      toast.success('تم رفع المرفق بنجاح');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error in uploadAttachment:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع المرفق');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [attachmentId]: true }));
      
      console.log('Deleting attachment with ID:', attachmentId);
      
      // First, get the attachment to retrieve the file URL
      const { data: attachment, error: fetchError } = await supabase
        .from('unified_task_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching attachment for deletion:', fetchError);
        throw new Error('فشل في العثور على المرفق للحذف');
      }
      
      if (!attachment) {
        throw new Error('لم يتم العثور على المرفق');
      }
      
      // Extract file path from URL
      const storageUrl = supabase.storage.from('task-attachments').getPublicUrl('test').data.publicUrl;
      const baseUrl = storageUrl.split('/test')[0];
      let filePath = attachment.file_url.replace(baseUrl + '/', '');
      
      console.log('Attempting to delete file from storage, path:', filePath);
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with DB deletion even if storage deletion fails
      }
      
      // Delete reference from database
      const { error: dbError } = await supabase
        .from('unified_task_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (dbError) {
        console.error('Error deleting attachment from database:', dbError);
        throw new Error('فشل في حذف المرفق من قاعدة البيانات');
      }
      
      toast.success('تم حذف المرفق بنجاح');
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المرفق');
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
    isUploading,
    uploadAttachment,
    uploadDeliverable,
    deleteAttachment,
    handleDownloadAttachment
  };
};
