import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

interface PhotosSectionProps {
  photos: string[];
  onPhotoUpload: (file: File) => Promise<void>;
  maxPhotos?: number;
}

export const PhotosSection = ({ 
  photos, 
  onPhotoUpload, 
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
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`صورة ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};