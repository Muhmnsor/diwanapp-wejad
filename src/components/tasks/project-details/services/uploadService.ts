
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const uploadAttachment = async (file: File, category: 'template' | 'submission' | 'attachment') => {
  try {
    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = `${category}s/${fileName}`;
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(category === 'template' ? 'templates' : 'attachments')
      .upload(filePath, file);
    
    if (error) {
      console.error(`Error uploading ${category}:`, error);
      return { error };
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(category === 'template' ? 'templates' : 'attachments')
      .getPublicUrl(filePath);
    
    return { 
      url: publicUrlData.publicUrl, 
      path: filePath,
      name: fileName,
      type: file.type
    };
  } catch (error) {
    console.error(`Error in uploadAttachment (${category}):`, error);
    return { error };
  }
};

export const saveTaskTemplate = async (
  taskId: string,
  fileUrl: string,
  fileName: string,
  fileType: string
) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { data, error } = await supabase
      .from('task_templates')
      .insert({
        task_id: taskId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        created_by: userId
      });
    
    if (error) {
      console.error("Error saving task template:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in saveTaskTemplate:", error);
    throw error;
  }
};
