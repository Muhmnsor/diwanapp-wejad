
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '@/store/authStore';

export interface TaskDeliverable {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  created_by: string | null;
  created_at: string;
  status: string;
  feedback: string | null;
}

export const useTaskDeliverables = (onUploadSuccess?: () => void, onDeleteSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();

  const uploadDeliverable = async (file: File, taskId: string, taskTable: string = 'tasks') => {
    try {
      console.log('Starting deliverable upload for task:', taskId);
      setIsUploading(true);
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${taskId}/deliverables/${fileName}`;
      
      // Upload file to storage
      console.log('Uploading deliverable to storage:', filePath);
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
      
      // Save file reference to database in task_deliverables table
      console.log('Saving deliverable reference to database, task_id:', taskId, 'file_url:', fileUrl);
      const { error: dbError } = await supabase
        .from('task_deliverables')
        .insert({
          task_id: taskId,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          created_by: user?.id || null,
          task_table: taskTable,
          status: 'pending'
        });
        
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw new Error(`خطأ في حفظ بيانات الملف: ${dbError.message}`);
      }
      
      toast.success('تم رفع المستلمات بنجاح');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error in uploadDeliverable:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء رفع المستلمات');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDeliverable = async (deliverableId: string) => {
    try {
      setIsDeleting(prev => ({ ...prev, [deliverableId]: true }));
      
      console.log('Deleting deliverable with ID:', deliverableId);
      
      // First, get the deliverable to retrieve the file URL
      const { data: deliverable, error: fetchError } = await supabase
        .from('task_deliverables')
        .select('file_url')
        .eq('id', deliverableId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching deliverable for deletion:', fetchError);
        throw new Error('فشل في العثور على المستلمات للحذف');
      }
      
      if (!deliverable) {
        throw new Error('لم يتم العثور على المستلمات');
      }
      
      // Extract file path from URL
      const storageUrl = supabase.storage.from('task-attachments').getPublicUrl('test').data.publicUrl;
      const baseUrl = storageUrl.split('/test')[0];
      let filePath = deliverable.file_url.replace(baseUrl + '/', '');
      
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
        .from('task_deliverables')
        .delete()
        .eq('id', deliverableId);
      
      if (dbError) {
        console.error('Error deleting deliverable from database:', dbError);
        throw new Error('فشل في حذف المستلمات من قاعدة البيانات');
      }
      
      toast.success('تم حذف المستلمات بنجاح');
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المستلمات');
      return false;
    } finally {
      setIsDeleting(prev => ({ ...prev, [deliverableId]: false }));
    }
  };

  const handleDownloadDeliverable = (fileUrl: string, fileName: string) => {
    try {
      // فتح الملف في نافذة جديدة
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading deliverable:', error);
      toast.error('حدث خطأ أثناء تنزيل المستلمات');
    }
  };

  const provideFeedback = async (deliverableId: string, feedback: string, status: 'approved' | 'rejected' = 'approved') => {
    try {
      const { error } = await supabase
        .from('task_deliverables')
        .update({
          feedback,
          status
        })
        .eq('id', deliverableId);
      
      if (error) {
        throw error;
      }
      
      toast.success('تم تقديم الملاحظات بنجاح');
      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('حدث خطأ أثناء تقديم الملاحظات');
      return false;
    }
  };

  return {
    isUploading,
    isDeleting,
    uploadDeliverable,
    deleteDeliverable,
    handleDownloadDeliverable,
    provideFeedback
  };
};
