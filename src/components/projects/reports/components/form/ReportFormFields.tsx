import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhotosSection } from "@/components/events/reports/PhotosSection";
import { Card } from "@/components/ui/card";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

interface ReportFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ReportFormFields = ({ form }: ReportFormFieldsProps) => {
  console.log("ReportFormFields - form values:", form.getValues());

  const handlePhotoUpload = async (file: File) => {
    try {
      const { publicUrl, error } = await handleImageUpload(file);
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

  const photos = form.watch('photos') || [];
  const validPhotos = photos.filter(photo => photo && typeof photo === 'object' && photo.url);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="program_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="اسم البرنامج" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="report_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="اسم التقرير" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="report_text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="نص التقرير" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">تفاصيل النشاط</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="detailed_description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="التفاصيل" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="activity_duration"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="مدة النشاط" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attendees_count"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="عدد المشاركين" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">الأهداف والتأثير</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="activity_objectives"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="الأهداف" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="impact_on_participants"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="الأثر على المشاركين" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">الصور</h3>
        <PhotosSection
          photos={validPhotos}
          onPhotoUpload={handlePhotoUpload}
          onPhotoDelete={handlePhotoDelete}
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
    </div>
  );
};