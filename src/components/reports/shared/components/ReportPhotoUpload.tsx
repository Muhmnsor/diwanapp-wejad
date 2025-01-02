import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportPhoto } from "../types";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

interface ReportPhotoUploadProps {
  photos: ReportPhoto[];
  onPhotosChange: (photos: ReportPhoto[]) => void;
  maxPhotos?: number;
}

export const ReportPhotoUpload = ({
  photos,
  onPhotosChange,
  maxPhotos = 6
}: ReportPhotoUploadProps) => {
  const handlePhotoUpload = async (file: File) => {
    try {
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const newPhoto: ReportPhoto = { url: publicUrl, description: '' };
      onPhotosChange([...photos, newPhoto]);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updatedPhotos = photos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
    onPhotosChange(updatedPhotos);
  };

  const handleDelete = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="space-y-2">
            <img 
              src={photo.url} 
              alt={photo.description || `صورة ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Input
              value={photo.description}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              placeholder="وصف الصورة"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(index)}
              className="w-full"
            >
              حذف
            </Button>
          </div>
        ))}
      </div>

      {photos.length < maxPhotos && (
        <div>
          <Label htmlFor="photo-upload">إضافة صورة</Label>
          <Input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
            }}
          />
        </div>
      )}
    </div>
  );
};