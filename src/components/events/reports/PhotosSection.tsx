import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { PhotosGallery } from "./PhotosGallery";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Photo {
  url: string;
  description: string;
}

interface PhotosSectionProps {
  photos: Photo[];
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoDelete: (index: number) => void;
  onPhotoDescriptionChange?: (index: number, description: string) => void;
  maxPhotos?: number;
  photoPlaceholders?: string[];
}

export const PhotosSection = ({ 
  photos, 
  onPhotoUpload, 
  onPhotoDelete,
  onPhotoDescriptionChange,
  maxPhotos = 6,
  photoPlaceholders = []
}: PhotosSectionProps) => {
  const handlePhotoUpload = async (file: File) => {
    if (photos.length >= maxPhotos) {
      toast.error(`لا يمكن إضافة أكثر من ${maxPhotos} صور`);
      return;
    }
    await onPhotoUpload(file);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">صور الفعالية (الحد الأقصى: {maxPhotos} صور)</label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: maxPhotos }).map((_, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm text-gray-600">{photoPlaceholders[index] || `صورة ${index + 1}`}</p>
            {photos[index] ? (
              <div className="space-y-2">
                <div className="relative">
                  <img 
                    src={photos[index].url} 
                    alt={photos[index].description || `صورة ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => onPhotoDelete(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                {onPhotoDescriptionChange && (
                  <div className="space-y-1">
                    <Label htmlFor={`photo-desc-${index}`}>وصف الصورة</Label>
                    <Input
                      id={`photo-desc-${index}`}
                      value={photos[index].description || ''}
                      onChange={(e) => onPhotoDescriptionChange(index, e.target.value)}
                      placeholder="أدخل وصفاً للصورة"
                    />
                  </div>
                )}
              </div>
            ) : (
              <ImageUpload 
                onChange={handlePhotoUpload} 
                value={null}
                className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};