import { ImageUpload } from "@/components/ui/image-upload";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PhotoWithDescription {
  url: string;
  description: string;
}

interface PhotosFieldProps {
  photos: PhotoWithDescription[];
  onPhotosChange: (photos: PhotoWithDescription[]) => void;
}

const PHOTO_DESCRIPTIONS = [
  "صورة للمشاركين في الفعالية",
  "صورة لتفاعل المقدم مع الحضور",
  "صورة للمواد التدريبية والأدوات المستخدمة",
  "صورة لأنشطة المجموعات",
  "صورة للعرض التقديمي",
  "صورة للحظات المميزة في الفعالية"
];

export const PhotosField = ({ photos, onPhotosChange }: PhotosFieldProps) => {
  const handleImageUpload = async (file: File, index: number) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const newPhotos = [...photos];
      newPhotos[index] = {
        url: publicUrl,
        description: PHOTO_DESCRIPTIONS[index]
      };
      onPhotosChange(newPhotos);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  return (
    <div className="space-y-4">
      <Label>صور الفعالية</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PHOTO_DESCRIPTIONS.map((description, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <ImageUpload
              onChange={(file) => handleImageUpload(file, index)}
              value={photos[index]?.url}
            />
          </div>
        ))}
      </div>
    </div>
  );
};