
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
      .upload(filePath, file);

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
