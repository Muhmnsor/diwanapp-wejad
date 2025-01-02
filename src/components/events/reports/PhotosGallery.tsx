import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Photo {
  url: string;
  description: string;
}

interface PhotosGalleryProps {
  photos: Photo[];
  onDelete: (index: number) => void;
  onDescriptionChange?: (index: number, description: string) => void;
}

export const PhotosGallery = ({ photos, onDelete, onDescriptionChange }: PhotosGalleryProps) => {
  if (!photos.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {photos.map((photo, index) => (
        <div key={index} className="space-y-2">
          <div className="relative group">
            <img
              src={photo.url}
              alt={photo.description || `صورة ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {onDescriptionChange && (
            <div className="space-y-1">
              <Label htmlFor={`gallery-photo-desc-${index}`}>وصف الصورة</Label>
              <Input
                id={`gallery-photo-desc-${index}`}
                value={photo.description || ''}
                onChange={(e) => onDescriptionChange(index, e.target.value)}
                placeholder="أدخل وصفاً للصورة"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};