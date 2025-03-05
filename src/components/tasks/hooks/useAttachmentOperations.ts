
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

type AttachmentCategory = 'creator' | 'comment' | 'assignee';

export const useAttachmentOperations = (onSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAttachment = async (file: File, taskId: string, category: AttachmentCategory) => {
    if (!file || !taskId) return { error: "Missing file or task ID" };

    setIsUploading(true);
    try {
      // Define a unique file path for the attachment
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `tasks/${taskId}/${fileName}`;

      // Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('task_attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('task_attachments')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }

      // Save the attachment metadata to the database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          attachment_category: category
        });

      if (dbError) {
        throw dbError;
      }

      if (onSuccess) {
        onSuccess();
      }

      return { success: true, filePath };
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("حدث خطأ أثناء رفع المرفق");
      return { error };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAttachment = async (attachmentId: string) => {
    try {
      // Get the attachment details to get the file path
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete the file from storage
      if (attachment?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('task_attachments')
          .remove([attachment.file_path]);

        if (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue with DB deletion even if storage deletion fails
        }
      }

      // Delete the record from the database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        throw dbError;
      }

      if (onSuccess) {
        onSuccess();
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("حدث خطأ أثناء حذف المرفق");
      return { error };
    }
  };

  return {
    uploadAttachment,
    deleteAttachment,
    isUploading
  };
};
