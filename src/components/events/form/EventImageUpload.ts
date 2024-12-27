import { supabase } from "@/integrations/supabase/client";

export const handleImageUpload = async (imageFile: File) => {
  try {
    const fileName = `event-images/${Date.now()}.${imageFile.name.split('.').pop()}`;
    const { error: uploadError, data } = await supabase.storage
      .from('event-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(fileName);

    return { publicUrl, error: null };
  } catch (error) {
    console.error('Error in handleImageUpload:', error);
    return { error };
  }
};