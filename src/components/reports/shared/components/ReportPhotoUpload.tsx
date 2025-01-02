import { ActivityPhotosSection } from "@/components/projects/activities/photos/ActivityPhotosSection";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";
import { ReportPhoto } from "../types";

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
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const newPhoto: ReportPhoto = { url: publicUrl, description: '' };
      onPhotosChange([...photos, newPhoto]);
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