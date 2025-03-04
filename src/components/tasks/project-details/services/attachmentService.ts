
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const downloadAttachment = async (url: string): Promise<void> => {
  try {
    // استخراج اسم الملف من الرابط
    const fileName = url.split('/').pop() || 'attachment';
    
    // تنزيل الملف
    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل تنزيل الملف');
    
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    // إنشاء رابط وهمي لتنزيل الملف
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    
    toast.success('تم تنزيل الملف بنجاح');
  } catch (error) {
    console.error('Error downloading attachment:', error);
    toast.error('حدث خطأ أثناء تنزيل الملف');
  }
};

export const getAttachmentUrl = async (taskId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('url')
      .eq('task_id', taskId)
      .single();
    
    if (error) {
      console.error('Error fetching attachment:', error);
      return null;
    }
    
    return data?.url || null;
  } catch (error) {
    console.error('Error in getAttachmentUrl:', error);
    return null;
  }
};
