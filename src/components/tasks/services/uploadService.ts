
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadAttachment = async (file: File): Promise<{ url: string; error: any } | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 11)}_${Date.now()}.${fileExt}`;
    const filePath = `task-comments/${fileName}`;

    const { data, error } = await supabase.storage
      .from('event-images') // استخدام مخزن الصور الموجود
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
      return { url: '', error };
    }

    // الحصول على الرابط العام للملف
    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Error handling file upload:", error);
    toast.error("حدث خطأ غير متوقع أثناء رفع الملف");
    return { url: '', error };
  }
};
