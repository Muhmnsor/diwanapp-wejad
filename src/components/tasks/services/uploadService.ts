
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export async function uploadAttachment(file: File, type: 'attachment' | 'template') {
  try {
    // Create a unique filename
    const uniqueId = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExt}`;
    const filePath = `${type === 'attachment' ? 'attachments' : 'templates'}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tasks')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return { error: uploadError.message };
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('tasks')
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  } catch (error) {
    console.error("Error in file upload:", error);
    return { error: "Failed to upload file" };
  }
}

export async function saveTaskTemplate(
  taskId: string,
  fileUrl: string,
  fileName: string,
  fileType: string
) {
  try {
    const { error } = await supabase
      .from('task_templates')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType
      });

    if (error) {
      console.error("Error saving task template:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in saveTaskTemplate:", error);
    throw error;
  }
}
