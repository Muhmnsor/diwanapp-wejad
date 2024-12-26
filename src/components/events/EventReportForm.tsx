import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

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

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ReportFormData>({
    defaultValues: {
      photos: Array(6).fill({ url: '', description: '' })
    }
  });

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
            photos: data.photos.filter(photo => photo.url && photo.description),
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
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <Label htmlFor={`photos.${index}.url`}>رابط الصورة {index + 1}</Label>
              <Input
                id={`photos.${index}.url`}
                {...register(`photos.${index}.url`)}
                placeholder="رابط الصورة"
              />
              <Label htmlFor={`photos.${index}.description`}>وصف الصورة {index + 1}</Label>
              <Textarea
                id={`photos.${index}.description`}
                {...register(`photos.${index}.description`)}
                placeholder="اكتب وصفاً للصورة..."
                className="h-20"
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