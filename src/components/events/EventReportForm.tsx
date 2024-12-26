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

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting report with data:', { ...data, eventId, executorId: user?.id });
      
      const { error } = await supabase
        .from('event_reports')
        .insert([
          {
            event_id: eventId,
            executor_id: user?.id,
            report_text: data.report_text,
            satisfaction_level: parseInt(data.satisfaction_level),
            photos: data.photos ? [data.photos] : [],
            video_links: data.video_links ? [data.video_links] : [],
            additional_links: data.additional_links ? [data.additional_links] : [],
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="report_text">نص التقرير</Label>
        <Textarea
          id="report_text"
          {...register("report_text", { required: true })}
          placeholder="اكتب تقريرك هنا..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="satisfaction_level">مستوى الرضا (1-5)</Label>
        <Input
          type="number"
          id="satisfaction_level"
          {...register("satisfaction_level", {
            required: true,
            min: 1,
            max: 5
          })}
          min="1"
          max="5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photos">روابط الصور</Label>
        <Input
          type="text"
          id="photos"
          {...register("photos")}
          placeholder="رابط الصورة"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_links">روابط الفيديو</Label>
        <Input
          type="text"
          id="video_links"
          {...register("video_links")}
          placeholder="رابط الفيديو"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_links">روابط إضافية</Label>
        <Input
          type="text"
          id="additional_links"
          {...register("additional_links")}
          placeholder="رابط إضافي"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};