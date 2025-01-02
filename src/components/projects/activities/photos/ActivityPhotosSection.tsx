import { PhotoCard } from "./PhotoCard";
import { PhotoUploadButton } from "./PhotoUploadButton";

interface ActivityPhotosSectionProps {
  photos: { url: string; description: string }[];
  onPhotoUpload: (file: File, index: number) => Promise<void>;
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
  console.log('ActivityPhotosSection - Current photos:', photos);

  // Create an array of slots with fixed positions
  const photoSlots = Array(maxPhotos).fill(null).map((_, index) => {
    const photo = photos.find((_, photoIndex) => photoIndex === index);
    return photo || null;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    console.log('Starting file upload process for slot:', slotIndex);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected for slot:', slotIndex);
      return;
    }

    console.log('Selected file for slot', slotIndex, ':', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    try {
      console.log('Attempting to upload file to slot:', slotIndex);
      await onPhotoUpload(file, slotIndex);
      console.log('File upload completed successfully for slot:', slotIndex);
    } catch (error) {
      console.error('Error uploading photo to slot', slotIndex, ':', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoSlots.map((photo, index) => (
          <div key={`photo-slot-${index}`} className="border rounded-lg p-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {photoPlaceholders[index]}
            </div>
            {photo ? (
              <PhotoCard
                photo={photo}
                index={index}
                onDelete={() => onPhotoDelete(index)}
                onDescriptionChange={(description) => onPhotoDescriptionChange(index, description)}
                placeholder={photoPlaceholders[index]}
              />
            ) : (
              <PhotoUploadButton
                onFileChange={(e) => handleFileChange(e, index)}
                placeholder={photoPlaceholders[index]}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};