import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";
import { ReportPhoto } from "@/types/report";

interface ReportPhotosSectionProps {
  photos: ReportPhoto[];
  onChange: (photos: ReportPhoto[]) => void;
  photoPlaceholders?: string[];
}

export const ReportPhotosSection = ({ 
  photos = [],
  onChange,
  photoPlaceholders = []
}: ReportPhotosSectionProps) => {
  console.log("ReportPhotosSection - Initial photos:", photos);

  const handlePhotoUpload = async (file: File, index: number) => {
    try {
      console.log('Uploading photo at index:', index);
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const currentPhotos = [...photos];
      currentPhotos[index] = { 
        url: publicUrl, 
        description: currentPhotos[index]?.description || '' 
      };
      
      onChange(currentPhotos);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    }
  };

  const handleDescriptionChange = (index: number, description: string) => {
    console.log('Updating description at index:', index, description);
    const currentPhotos = [...photos];
    currentPhotos[index] = { 
      ...currentPhotos[index], 
      description 
    };
    onChange(currentPhotos);
  };

  const handleDeletePhoto = (index: number) => {
    console.log('Deleting photo at index:', index);
    const currentPhotos = [...photos];
    currentPhotos.splice(index, 1);
    onChange(currentPhotos);
    toast.success('تم حذف الصورة بنجاح');
  };

  // Initialize array with 6 slots if needed
  const displayPhotos = [...photos];
  while (displayPhotos.length < 6) {
    displayPhotos.push({ url: '', description: '' });
  }

  const defaultPhotoPlaceholders = [
    "صورة تظهر تفاعل المستفيدين والجمهور مع المحتوى",
    "صورة توضح مكان إقامة النشاط",
    "صورة للمتحدثين أو المدربين",
    "صورة للمواد التدريبية أو التعليمية",
    "صورة للأنشطة التفاعلية",
    "صورة ختامية للنشاط"
  ];

  const finalPlaceholders = photoPlaceholders.length > 0 ? photoPlaceholders : defaultPhotoPlaceholders;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">الصور</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayPhotos.map((photo, index) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="space-y-2">
              {photo.url ? (
                <div className="relative aspect-video">
                  <img
                    src={photo.url}
                    alt={`صورة ${index + 1}`}
                    className="rounded-md object-cover w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeletePhoto(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-orange-500 hover:border-orange-600 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, index);
                    }}
                  />
                  <div className="text-center">
                    <ImagePlus className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium text-orange-500 mb-1">
                      انقر لإضافة صورة
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {finalPlaceholders[index] || `اختر صورة ${index + 1}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="mb-2 block">وصف الصورة</Label>
              <Input
                placeholder={finalPlaceholders[index] || "أدخل وصفاً للصورة"}
                value={photo.description}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
              />
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};