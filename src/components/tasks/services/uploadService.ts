
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

    // تحقق أولاً من وجود الـ bucket، وإذا لم يكن موجودًا قم بإنشائه
    try {
      const { data: bucketExists, error: bucketCheckError } = await supabase.storage
        .getBucket('task-attachments');
    
      if (bucketCheckError) {
        console.log("Error checking bucket:", bucketCheckError);
        console.log("Trying to create bucket...");
        
        const { data: newBucket, error: createBucketError } = await supabase.storage
          .createBucket('task-attachments', { 
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
        if (createBucketError) {
          console.error("Failed to create bucket:", createBucketError);
          // Continue anyway, as the bucket might exist but we don't have permissions to check it
        } else {
          console.log("Bucket created successfully:", newBucket);
        }
      } else {
        console.log("Bucket exists:", bucketExists);
      }
    } catch (bucketError) {
      console.error("Bucket operation error:", bucketError);
      // Continue with upload attempt regardless
    }

    // Try uploading with complete error details
    console.log("Attempting to upload file to storage...");
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Error uploading file (detailed):", JSON.stringify(error));
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
    
    console.log("Saving attachment reference:", {
      task_id: taskId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      attachment_category: category,
      created_by: userId
    });

    // Try direct insert to unified_task_attachments first
    console.log("Trying to insert into unified_task_attachments table");
    const { data: unifiedData, error: unifiedError } = await supabase
      .from('unified_task_attachments')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        attachment_category: category,
        task_table: 'tasks', // Specifying the source table
        created_by: userId
      })
      .select();
      
    if (unifiedError) {
      console.error("Error saving to unified_task_attachments (Details):", JSON.stringify(unifiedError));
      
      // Try using task_attachments table as fallback
      console.log("Trying fallback to task_attachments table");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_url: fileUrl,
          file_name: fileName,
          file_type: fileType,
          attachment_category: category,
          created_by: userId
        })
        .select();
        
      if (fallbackError) {
        console.error("Fallback also failed - task_attachments insert error:", JSON.stringify(fallbackError));
        
        // Last resort - try inserting with minimal fields
        console.log("Trying minimal fields insert as last resort");
        const { data: minimalData, error: minimalError } = await supabase
          .from('unified_task_attachments')
          .insert({
            task_id: taskId,
            file_url: fileUrl,
            file_name: fileName || 'unknown',
            content: ' ', // Adding a content field in case it's required
            task_table: 'tasks'
          })
          .select();
          
        if (minimalError) {
          console.error("All attachment saving attempts failed:", minimalError);
          throw minimalError;
        } else {
          console.log("Minimal attachment reference saved:", minimalData);
          return minimalData;
        }
      }
      
      console.log("Attachment reference saved to task_attachments:", fallbackData);
      return fallbackData;
    }
    
    console.log("Attachment reference saved to unified_task_attachments:", unifiedData);
    return unifiedData;
  } catch (error) {
    console.error("Error in saveAttachmentReference (Full details):", error);
    // Still return something to prevent cascading errors
    return { error, message: "Failed to save attachment reference but file may have been uploaded" };
  }
};
