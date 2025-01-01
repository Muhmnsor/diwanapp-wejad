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
  "صورة المقدم مع خلفية تظهر الشاشة أو ما يدل على الفعالية",
  "صورة تفاعل المقدم مع المستفيدين وتوضح التواصل المباشر",
  "صورة للمواد المستخدمة والضيافة قبل استهلاكها",
  "صورة تظهر تفاعل المستفيدين والجمهور مع المحتوى",
  "صورة جماعية للمشاركين في الفعالية",
  "صورة فردية لمستفيد متفاعل تظهر الأثر الإيجابي"
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
            {photos[index]?.url ? (
              <div className="relative w-full h-48">
                <img
                  src={photos[index].url}
                  alt={description}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    const newPhotos = [...photos];
                    newPhotos[index] = { url: '', description: '' };
                    onPhotosChange(newPhotos);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <ImageUpload
                onChange={(file) => handleImageUpload(file, index)}
                value={null}
                className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};