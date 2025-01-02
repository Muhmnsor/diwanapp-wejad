import { PhotoUploadButton } from "./PhotoUploadButton";
import { PhotoGrid } from "./PhotoGrid";

interface ActivityPhotosSectionProps {
  photos: { url: string; description: string; }[];
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoDelete: (index: number) => void;
  onPhotoDescriptionChange: (index: number, description: string) => void;
  maxPhotos?: number;
}

const photoPlaceholders = [
  "صورة المقدم وخلفه الشاشة او مايدل على النشاط",
  "تفاعل المقدم مع المستفيدين",
  "الضيافة ان وجدت قبل استهلاكها",
  "تفاعل المستفيدين او الجمهور",
  "صورة جماعية",
  "صورة فردية لمستفيد متفاعل"
];

export const ActivityPhotosSection = ({
  photos,
  onPhotoUpload,
  onPhotoDelete,
  onPhotoDescriptionChange,
  maxPhotos = 6
}: ActivityPhotosSectionProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onPhotoUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {photos.length < maxPhotos && (
        <PhotoUploadButton
          onFileChange={handleFileChange}
          placeholder={photoPlaceholders[photos.length]}
        />
      )}

      <PhotoGrid
        photos={photos}
        onPhotoDelete={onPhotoDelete}
        onPhotoDescriptionChange={onPhotoDescriptionChange}
        placeholders={photoPlaceholders}
      />
    </div>
  );
};