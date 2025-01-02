import { PhotoUploadButton } from "./PhotoUploadButton";
import { PhotoGrid } from "./PhotoGrid";

interface ActivityPhotosSectionProps {
  photos: { url: string; description: string; }[];
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoDelete: (index: number) => void;
  onPhotoDescriptionChange: (index: number, description: string) => void;
  maxPhotos?: number;
  photoPlaceholders?: string[];
}

export const ActivityPhotosSection = ({
  photos,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoDescriptionChange,
  maxPhotos = 6,
  photoPlaceholders = []
}: ActivityPhotosSectionProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onPhotoUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {photos.length < (maxPhotos || 6) && (
        <PhotoUploadButton
          onFileChange={handleFileChange}
          placeholder={photoPlaceholders[photos.length]}
        />
      )}

      <PhotoGrid
        photos={photos}
        onPhotoDelete={onPhotoDelete}
        onPhotoDescriptionChange={onPhotoDescriptionChange}
      />
    </div>
  );
};