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
  // Create empty slots array to represent all available photo slots
  const photoSlots = Array(maxPhotos).fill(null).map((_, index) => {
    return photos[index] || { url: '', description: photoPlaceholders[index] };
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    console.log('Handling file change for slot:', index);
    const file = e.target.files?.[0];
    if (file) {
      // Create a copy of the photos array
      const updatedPhotos = [...photos];
      // Create temporary URL for immediate preview
      const tempUrl = URL.createObjectURL(file);
      // Update the specific slot with the temporary URL
      updatedPhotos[index] = { url: tempUrl, description: photoPlaceholders[index] };
      onPhotosChange(updatedPhotos);
      
      try {
        // Wait for the actual upload to complete
        await onPhotoUpload(file);
        // The URL will be updated by the parent component after successful upload
      } catch (error) {
        console.error('Error uploading photo:', error);
        // Remove the temporary preview on error
        const revertedPhotos = [...photos];
        revertedPhotos[index] = { url: '', description: photoPlaceholders[index] };
        onPhotosChange(revertedPhotos);
      }
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
              <PhotoGrid
                photos={[{ url: photo.url, description: '' }]}
                onPhotoDelete={() => onPhotoDelete(index)}
                onPhotoDescriptionChange={(_, description) => onPhotoDescriptionChange(index, description)}
                placeholders={[]}
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