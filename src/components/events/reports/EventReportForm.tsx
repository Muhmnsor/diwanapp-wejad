
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ReportPhotoUpload } from "./components/ReportPhotoUpload";
import { ReportMetricsFields } from "./components/ReportMetricsFields";
import { EventReportFormValues, Photo } from "./types";

interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
}

export const EventReportForm = ({ eventId, onClose }: EventReportFormProps) => {
  const [photos, setPhotos] = useState<Photo[]>(Array(6).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventReportFormValues>({
    defaultValues: {
      report_name: "",
      report_text: "",
      objectives: "",
      impact_on_participants: "",
      speaker_name: "",
      attendees_count: 0,
      absent_count: 0,
      satisfaction_level: 0,
    },
  });

  const onSubmit = async (values: EventReportFormValues) => {
    try {
      setIsSubmitting(true);

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("date, time")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      const { error: insertError } = await supabase.from("event_reports").insert({
        ...values,
        event_id: eventId,
        photos: photos.filter(Boolean).map(p => p.url),
        photo_descriptions: photos.filter(Boolean).map(p => p.description),
        execution_date: eventData.date,
        execution_time: eventData.time,
      });

      if (insertError) throw insertError;

      toast.success("تم إضافة التقرير بنجاح");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="report_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم التقرير</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="speaker_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المتحدث/المنظم</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="report_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نص التقرير</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>أهداف الفعالية</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="impact_on_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الأثر على المشاركين</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ReportMetricsFields form={form} />
        
        <ReportPhotoUpload 
          photos={photos}
          onPhotosChange={setPhotos}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
