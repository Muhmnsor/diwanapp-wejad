
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ReportPhotoUpload } from "./components/ReportPhotoUpload";
import { ReportMetricsFields } from "./components/ReportMetricsFields";
import { ReportBasicFields } from "./components/ReportBasicFields";
import { ReportDescriptionFields } from "./components/ReportDescriptionFields";
import { ReportFeedbackComments } from "./components/ReportFeedbackComments";
import { ReportFormActions } from "./components/ReportFormActions";
import { ReportsList } from "./components/ReportsList";
import { EventReportFormValues, Photo } from "./types";

interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
}

export const EventReportForm: React.FC<EventReportFormProps> = ({ eventId, onClose }) => {
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
      satisfaction_level: 0
    }
  });

  useEffect(() => {
    const fetchEventTitle = async () => {
      const { data: event } = await supabase
        .from("events")
        .select("title")
        .eq("id", eventId)
        .single();

      if (event) {
        form.setValue("report_name", `تقرير فعالية ${event.title}`);
      }
    };

    fetchEventTitle();
  }, [eventId, form]);

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
        <ReportBasicFields form={form} />
        <ReportDescriptionFields form={form} />
        <ReportMetricsFields form={form} eventId={eventId} />
        <ReportPhotoUpload photos={photos} onPhotosChange={setPhotos} />
        <ReportFeedbackComments eventId={eventId} />
        <ReportFormActions isSubmitting={isSubmitting} onClose={onClose} />
      </form>
      <ReportsList eventId={eventId} />
    </Form>
  );
};
