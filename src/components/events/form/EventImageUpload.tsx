import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event as CustomEvent } from "@/store/eventStore";

export const handleImageUpload = async (
  file: File,
  setIsUploading: (value: boolean) => void,
  setFormData: (value: CustomEvent) => void
) => {
  setIsUploading(true);
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `event-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    setFormData(prev => ({
      ...prev,
      imageUrl: publicUrl,
      image_url: publicUrl
    }));

    toast.success("تم رفع الصورة بنجاح");
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("حدث خطأ أثناء رفع الصورة");
  } finally {
    setIsUploading(false);
  }
};