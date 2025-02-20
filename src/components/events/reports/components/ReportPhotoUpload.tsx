
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { Photo } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { photoPlaceholders } from "@/utils/reports/constants";

interface ReportPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

export const ReportPhotoUpload = ({
  photos,
  onPhotosChange,
  maxPhotos = 6
}: ReportPhotoUploadProps) => {
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      const updatedPhotos = [...photos];
      // تعيين الصورة في نفس الموقع المحدد
      updatedPhotos[index] = {
        url: publicUrl,
        description: photoPlaceholders[index],
        index
      };

      // تصفية القيم الفارغة مع الحفاظ على الترتيب
      const cleanedPhotos = updatedPhotos.map((photo, i) => 
        photo ? { ...photo, index: i } : null
      ).filter((p): p is Photo => p !== null);

      onPhotosChange(cleanedPhotos);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    // حذف الصورة مع الحفاظ على المواقع
    updatedPhotos[index] = null;
    
    // تنظيف المصفوفة مع الحفاظ على ترتيب الصور المتبقية
    const cleanedPhotos = updatedPhotos
      .filter((p): p is Photo => p !== null)
      .map((photo, newIndex) => ({
        ...photo,
        index: photo.index // الحفاظ على الفهرس الأصلي
      }));

    onPhotosChange(cleanedPhotos);
  };

  // تنظيم الصور في المواقع الصحيحة
  const organizedPhotos = Array(maxPhotos).fill(null);
  photos.forEach(photo => {
    if (photo && typeof photo.index === 'number') {
      let photoUrl: string;
      
      if (typeof photo.url === 'string') {
        try {
          const parsed = JSON.parse(photo.url);
          photoUrl = parsed.url || photo.url;
        } catch {
          photoUrl = photo.url;
        }
      } else if (photo.url && typeof photo.url === 'object' && 'url' in photo.url) {
        photoUrl = (photo.url as { url: string }).url;
      } else {
        photoUrl = '';
      }

      if (photoUrl) {
        organizedPhotos[photo.index] = {
          ...photo,
          url: photoUrl
        };
      }
    }
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(maxPhotos)
          .fill(null)
          .map((_, index) => {
            const photo = organizedPhotos[index];
            return (
              <Card key={index} className="p-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  {photoPlaceholders[index]}
                </div>

                <div className="relative aspect-square border rounded-lg overflow-hidden">
                  {photo?.url ? (
                    <div className="relative h-full">
                      <img
                        src={photo.url}
                        alt={`صورة ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer bg-muted hover:bg-muted/80 transition-colors">
                      <ImagePlus className="h-8 w-8 mb-2" />
                      <span className="text-sm">إضافة صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, index)}
                      />
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};
