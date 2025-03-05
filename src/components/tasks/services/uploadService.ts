
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadAttachment = async (
  file: File, 
  category: 'creator' | 'assignee' | 'comment' = 'comment'
): Promise<{ url: string; error: any; category?: string } | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        contentType: file.type // إضافة نوع المحتوى
      });

    if (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
      return { url: '', error };
    }

    // الحصول على الرابط العام للملف
    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    return { 
      url: publicUrl, 
      error: null,
      category 
    };
  } catch (error) {
    console.error("Error handling file upload:", error);
    toast.error("حدث خطأ غير متوقع أثناء رفع الملف");
    return { url: '', error };
  }
};

// حفظ معلومات المرفق في قاعدة البيانات
export const saveAttachmentReference = async (
  taskId: string,
  fileUrl: string,
  fileName: string,
  fileType: string | undefined,
  category: string = 'creator'
) => {
  try {
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;
    
    console.log("Saving attachment reference:", {
      task_id: taskId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      content_type: fileType,
      attachment_category: category,
      created_by: userId
    });

    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        content_type: fileType,
        attachment_category: category,
        created_by: userId
      });

    if (error) {
      console.error("Error saving attachment reference:", error);
      throw error;
    }

    console.log("Attachment reference saved successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in saveAttachmentReference:", error);
    throw error;
  }
};
