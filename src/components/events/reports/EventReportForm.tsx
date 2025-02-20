
import React, { useState, useEffect } from "react";
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
import { ReportFeedbackComments } from "./components/ReportFeedbackComments";
import { EventReportFormValues, Photo } from "./types";
import { useQuery } from "@tanstack/react-query";

interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
}

export const EventReportForm: React.FC<EventReportFormProps> = ({ eventId, onClose }) => {
  const [photos, setPhotos] = useState<Photo[]>(Array(6).fill(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب معلومات الفعالية وعدد التقارير الحالية
  const { data: eventInfo } = useQuery({
    queryKey: ['event-info', eventId],
    queryFn: async () => {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const { count: reportsCount, error: countError } = await supabase
        .from('event_reports')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (countError) throw countError;

      return {
        title: eventData.title,
        reportsCount: reportsCount || 0
      };
    }
  });

  // تهيئة النموذج مع الاسم التلقائي
  const form = useForm<EventReportFormValues>({
    defaultValues: {
      report_name: eventInfo ? 
        `تقرير ${eventInfo.title}${eventInfo.reportsCount > 0 ? ` ${eventInfo.reportsCount + 1}` : ''}` : 
        "",
      report_text: "",
      objectives: "",
      impact_on_participants: "",
      speaker_name: "",
      attendees_count: 0,
      absent_count: 0,
      satisfaction_level: 0,
    },
  });

  // تحديث اسم التقرير عندما تتغير معلومات الفعالية
  useEffect(() => {
    if (eventInfo) {
      const reportName = `تقرير ${eventInfo.title}${eventInfo.reportsCount > 0 ? ` ${eventInfo.reportsCount + 1}` : ''}`;
      form.setValue('report_name', reportName);
    }
  }, [eventInfo, form]);

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
              <FormLabel>اسم التقرير (تلقائي)</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted" />
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

        <ReportMetricsFields 
          form={form} 
          eventId={eventId}
        />
        
        <ReportPhotoUpload 
          photos={photos}
          onPhotosChange={setPhotos}
        />

        <ReportFeedbackComments 
          eventId={eventId}
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
