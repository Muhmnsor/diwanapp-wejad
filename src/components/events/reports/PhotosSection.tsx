import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { PhotosGallery } from "./PhotosGallery";

interface PhotosSectionProps {
  photos: string[];
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoDelete: (index: number) => void;
  maxPhotos?: number;
}

export const PhotosSection = ({ 
  photos, 
  onPhotoUpload, 
  onPhotoDelete,
  maxPhotos = 6 
}: PhotosSectionProps) => {
  const handlePhotoUpload = async (file: File) => {
    if (photos.length >= maxPhotos) {
      toast.error(`لا يمكن إضافة أكثر من ${maxPhotos} صور`);
      return;
    }
    await onPhotoUpload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">صور الفعالية (الحد الأقصى: {maxPhotos} صور)</label>
      <ImageUpload onChange={handlePhotoUpload} value={photos[photos.length - 1]} />
      <PhotosGallery photos={photos} onDelete={onPhotoDelete} />
    </div>
  );
};