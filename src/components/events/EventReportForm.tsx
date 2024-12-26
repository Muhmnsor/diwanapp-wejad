import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

interface PhotoWithDescription {
  url: string;
  description: string;
}

interface ReportFormData {
  report_text: string;
  detailed_description: string;
  photos: PhotoWithDescription[];
}

const PHOTO_DESCRIPTIONS = [
  "صورة للمشاركين في الفعالية",
  "صورة لتفاعل المقدم مع الحضور",
  "صورة للمواد التدريبية والأدوات المستخدمة",
  "صورة لأنشطة المجموعات",
  "صورة للعرض التقديمي",
  "صورة للحظات المميزة في الفعالية"
];

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ReportFormData>({
    defaultValues: {
      photos: Array(6).fill({ url: '', description: '' })
    }
  });

  const photos = watch('photos');

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
      setValue('photos', newPhotos);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      console.log('Submitting report with data:', { ...data, eventId, executorId: user?.id });
      
      const { error } = await supabase
        .from('event_reports')
        .insert([
          {
            event_id: eventId,
            executor_id: user?.id,
            report_text: data.report_text,
            detailed_description: data.detailed_description,
            photos: data.photos.filter(photo => photo.url),
          }
        ]);

      if (error) {
        console.error('Error submitting report:', error);
        throw error;
      }

      console.log('Report submitted successfully');
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="report_text">نص التقرير</Label>
        <Textarea
          id="report_text"
          {...register("report_text", { required: true })}
          placeholder="اكتب تقريرك هنا..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailed_description">تفاصيل الفعالية الدقيقة</Label>
        <Textarea
          id="detailed_description"
          {...register("detailed_description", { required: true })}
          placeholder="اكتب تفاصيل الفعالية بشكل دقيق..."
          className="h-32"
        />
      </div>

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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};