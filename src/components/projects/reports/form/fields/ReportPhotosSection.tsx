import { Card } from "@/components/ui/card";
import { ActivityPhotosSection } from "@/components/projects/activities/photos/ActivityPhotosSection";
import { UseFormReturn } from "react-hook-form";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

interface ReportPhotosSectionProps {
  form: UseFormReturn<any>;
}

export const ReportPhotosSection = ({ form }: ReportPhotosSectionProps) => {
  const handlePhotoUpload = async (file: File) => {
    try {
      const { publicUrl, error } = await handleImageUpload(file, 'project');
      if (error) throw error;
      
      const currentPhotos = form.getValues('photos') || [];
      const newPhoto = { url: publicUrl, description: '' };
      form.setValue('photos', [...currentPhotos, newPhoto]);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handlePhotoDelete = (index: number) => {
    const currentPhotos = form.getValues('photos') || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setValue('photos', newPhotos);
  };

  const handlePhotoDescriptionChange = (index: number, description: string) => {
    const currentPhotos = form.getValues('photos') || [];
    const updatedPhotos = currentPhotos.map((photo, i) => 
      i === index ? { ...photo, description } : photo
    );
    form.setValue('photos', updatedPhotos);
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">الصور</h3>
      <ActivityPhotosSection
        photos={form.watch('photos') || []}
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
        onPhotoDescriptionChange={handlePhotoDescriptionChange}
        maxPhotos={6}
        photoPlaceholders={[
          "صورة تظهر تفاعل المستفيدين والجمهور مع المحتوى",
          "صورة توضح مكان إقامة النشاط",
          "صورة للمتحدثين أو المدربين",
          "صورة للمواد التدريبية أو التعليمية",
          "صورة للأنشطة التفاعلية",
          "صورة ختامية للنشاط"
        ]}
      />
    </Card>
  );
};