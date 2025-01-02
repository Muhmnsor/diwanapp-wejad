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

  // Create empty slots array to represent all available photo slots
  const photoSlots = Array(maxPhotos).fill(null).map((_, index) => {
    return photos[index] || { url: '', description: photoPlaceholders[index] };
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    console.log('Starting file upload process for slot:', index);
    const file = e.target.files?.[0];
    
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      try {
        console.log('Attempting to upload file...');
        await onPhotoUpload(file, index);
        console.log('File upload completed successfully');
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoSlots.map((photo, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              {photoPlaceholders[index]}
            </div>
            {photo.url ? (
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