import { supabase } from '@/integrations/supabase/client';

export const handleImageUpload = async (file: File, type: 'event' | 'project' = 'event') => {
  try {
    console.log('Starting image upload process');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const folderPath = type === 'project' ? 'project-reports' : 'event-reports';
    const filePath = `${folderPath}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return { error };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    console.log('Image uploaded successfully:', publicUrl);
    return { publicUrl };

  } catch (error) {
    console.error('Error in handleImageUpload:', error);
    return { error };
  }
};