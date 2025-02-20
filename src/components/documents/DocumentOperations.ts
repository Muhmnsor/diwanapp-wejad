
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { determineStatus } from "@/utils/documentStatus";

export const downloadFile = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) throw error;

    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('حدث خطأ أثناء تحميل الملف');
  }
};

export const handleDelete = async (id: string, filePath: string | undefined, onSuccess: () => void) => {
  try {
    if (filePath) {
      await supabase.storage
        .from('documents')
        .remove([filePath]);
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('تم حذف المستند بنجاح');
    onSuccess();
  } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('حدث خطأ أثناء حذف المستند');
  }
};

export const handleFileUpload = async (
  file: File,
  userId: string,
  documentData: {
    name: string;
    type: string;
    expiry_date: string;
    issuer: string;
  },
  onSuccess: () => void
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const status = determineStatus(documentData.expiry_date);

    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        status: status,
        created_by: userId
      });

    if (insertError) {
      await supabase.storage
        .from('documents')
        .remove([filePath]);
      throw insertError;
    }

    toast.success('تم إضافة المستند بنجاح');
    onSuccess();
    
  } catch (error) {
    console.error('Error adding document:', error);
    toast.error('حدث خطأ أثناء إضافة المستند');
    throw error;
  }
};
