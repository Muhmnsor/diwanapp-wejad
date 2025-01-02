import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ActivityPhotosSection } from "../../activities/photos/ActivityPhotosSection";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

interface ActivityReportFormFieldsProps {
  form: UseFormReturn<any>;
}

export const ActivityReportFormFields = ({ form }: ActivityReportFormFieldsProps) => {
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
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">معلومات التقرير الأساسية</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="program_name"
            render={({ field }) => (
              <FormItem>
                <Label>اسم البرنامج</Label>
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
                <Label>اسم التقرير</Label>
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
                <Label>نص التقرير</Label>
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
                <Label>التفاصيل</Label>
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
                  <Label>مدة النشاط</Label>
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
                  <Label>عدد المشاركين</Label>
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
                <Label>الأهداف</Label>
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
                <Label>الأثر على المشاركين</Label>
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
    </div>
  );
};