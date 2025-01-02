import { ActivityPhotosSection } from "@/components/projects/activities/photos/ActivityPhotosSection";
import { ReportPhoto } from "@/types/projectReport";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportPhotoUploadProps {
  photos: ReportPhoto[];
  onPhotosChange: (photos: ReportPhoto[]) => void;
  maxPhotos?: number;
}

export const ReportPhotoUpload = ({
  photos,
  onPhotosChange,
  maxPhotos = 6
}: ReportPhotoUploadProps) => {
  console.log('ReportPhotoUpload - Current photos:', photos);

  const handlePhotoUpload = async (file: File, index: number) => {
    try {
      console.log(`Uploading photo for index ${index}:`, file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `report-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      console.log(`Successfully uploaded photo to ${publicUrl}`);

      // Create a new array with the new photo at the specified index
      const updatedPhotos = [...photos];
      updatedPhotos[index] = {
        url: publicUrl,
        description: '',
        index: index // Explicitly set the index
      };

      console.log('Updated photos array:', updatedPhotos);
      onPhotosChange(updatedPhotos);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error in handlePhotoUpload:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  const handlePhotoDelete = (index: number) => {
    console.log(`Deleting photo at index ${index}`);
    const updatedPhotos = photos.filter((_, i) => i !== index);
    console.log('Updated photos after deletion:', updatedPhotos);
    onPhotosChange(updatedPhotos);
    toast.success('تم حذف الصورة بنجاح');
  };

  const handleDescriptionChange = (index: number, description: string) => {
    console.log(`Updating description for photo at index ${index}:`, description);
    const updatedPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
    console.log('Updated photos after description change:', updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <ActivityPhotosSection
      photos={photos}
      onPhotoUpload={handlePhotoUpload}
      onPhotoDelete={handlePhotoDelete}
      onPhotoDescriptionChange={handleDescriptionChange}
      maxPhotos={maxPhotos}
    />
  );
};