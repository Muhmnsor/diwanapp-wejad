import { PhotoCard } from "./PhotoCard";

interface PhotoGridProps {
  photos: { url: string; description: string }[];
  onPhotoDelete: (index: number) => void;
  onPhotoDescriptionChange: (index: number, description: string) => void;
}

export const PhotoGrid = ({
  photos,
  onPhotoDelete,
  onPhotoDescriptionChange,
}: PhotoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.url}
          photo={photo}
          index={index}
          onDelete={() => onPhotoDelete(index)}
          onDescriptionChange={(description) => onPhotoDescriptionChange(index, description)}
        />
      ))}
    </div>
  );
};