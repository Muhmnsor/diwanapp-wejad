import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, Trash2 } from "lucide-react";
import Image from "@/components/ui/image";

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
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <Label
            htmlFor="photo-upload"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md cursor-pointer"
          >
            <ImagePlus className="h-4 w-4" />
            إضافة صورة
          </Label>
          {photoPlaceholders[photos.length] && (
            <span className="text-sm text-muted-foreground">
              اقتراح: {photoPlaceholders[photos.length]}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <Card key={photo.url} className="p-4 space-y-4">
            <div className="relative aspect-video">
              <Image
                src={photo.url}
                alt={`صورة ${index + 1}`}
                className="rounded-md object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="وصف الصورة"
                value={photo.description}
                onChange={(e) => onPhotoDescriptionChange(index, e.target.value)}
              />
              
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onPhotoDelete(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف الصورة
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};