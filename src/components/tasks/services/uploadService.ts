
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

    console.log("Uploading file:", file.name, "with category:", category);

    // تحقق من وجود الملف
    if (!file) {
      console.error("No file provided");
      return { url: '', error: "No file provided" };
    }

    // رفع الملف إلى التخزين
    console.log("Attempting to upload file to storage bucket: task-attachments");
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Error uploading file:", JSON.stringify(error));
      toast.error("حدث خطأ أثناء رفع الملف");
      return { url: '', error };
    }

    // الحصول على الرابط العام للملف
    const { data: { publicUrl } } = supabase.storage
      .from('task-attachments')
      .getPublicUrl(filePath);

    console.log("File uploaded successfully. Public URL:", publicUrl);

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
    // Get current user ID from auth
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;
    
    const attachmentData = {
      task_id: taskId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      attachment_category: category,
      task_table: 'tasks', // Default value
      created_by: userId
    };
    
    console.log("Saving attachment reference:", attachmentData);

    // Try direct insert to unified_task_attachments
    console.log("Trying to insert into unified_task_attachments table");
    const { data: unifiedData, error: unifiedError } = await supabase
      .from('unified_task_attachments')
      .insert(attachmentData)
      .select();
      
    if (unifiedError) {
      console.error("Error saving to unified_task_attachments:", unifiedError.message);
      
      // Try using task_attachments table as fallback
      console.log("Trying fallback to task_attachments table");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('task_attachments')
        .insert(attachmentData)
        .select();
        
      if (fallbackError) {
        console.error("Fallback also failed:", fallbackError.message);
        throw fallbackError;
      }
      
      console.log("Attachment reference saved to task_attachments:", fallbackData);
      return fallbackData;
    }
    
    console.log("Attachment reference saved to unified_task_attachments:", unifiedData);
    return unifiedData;
  } catch (error) {
    console.error("Error in saveAttachmentReference:", error);
    throw error;
  }
};
