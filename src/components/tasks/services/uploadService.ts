
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export type AttachmentCategory = 'attachment' | 'template' | 'comment' | 'assignee' | 'creator';

export async function uploadAttachment(file: File, category: AttachmentCategory) {
  try {
    // Create a unique filename
    const uniqueId = uuidv4();
    const fileExt = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExt}`;
    let filePath = '';
    
    // Determine the folder based on the category
    switch (category) {
      case 'attachment':
      case 'template':
        filePath = `${category}s/${fileName}`;
        break;
      case 'comment':
        filePath = `comments/${fileName}`;
        break;
      case 'assignee':
        filePath = `assignee/${fileName}`;
        break;
      case 'creator':
        filePath = `creator/${fileName}`;
        break;
      default:
        filePath = `attachments/${fileName}`;
    }

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

export async function saveAttachmentReference(
  taskId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  category: AttachmentCategory
) {
  try {
    const { error } = await supabase
      .from('unified_task_attachments')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        attachment_category: category,
        task_table: 'tasks',
        created_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      console.error("Error saving attachment reference:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in saveAttachmentReference:", error);
    throw error;
  }
}

export async function getTaskAttachments(taskId: string, category?: AttachmentCategory) {
  try {
    let query = supabase
      .from('unified_task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .eq('task_table', 'tasks');
      
    if (category) {
      query = query.eq('attachment_category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching task attachments:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getTaskAttachments:", error);
    return [];
  }
}
