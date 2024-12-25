import { ImageUpload } from "@/components/ui/image-upload";

interface PhotosSectionProps {
  photos: string[];
  onPhotoUpload: (file: File) => Promise<void>;
}

export const PhotosSection = ({ photos, onPhotoUpload }: PhotosSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">صور الفعالية</label>
      <ImageUpload onChange={onPhotoUpload} value={photos[photos.length - 1]} />
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