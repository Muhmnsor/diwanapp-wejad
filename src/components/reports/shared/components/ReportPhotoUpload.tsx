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
  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `report-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const newPhoto: ReportPhoto = { url: publicUrl, description: '' };
      onPhotosChange([...photos, newPhoto]);
      
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handlePhotoDelete = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updatedPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
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