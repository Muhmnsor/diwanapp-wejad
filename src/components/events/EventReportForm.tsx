import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Form } from "@/components/ui/form";
import { ReportBasicFields } from "./reports/form/fields/ReportBasicFields";
import { ReportDetailsFields } from "./reports/form/fields/ReportDetailsFields";
import { ReportMetadataFields } from "./reports/form/fields/ReportMetadataFields";
import { ReportObjectivesFields } from "./reports/form/fields/ReportObjectivesFields";
import { PhotosField } from "./reports/form/PhotosField";
import { submitReport } from "./reports/form/ReportFormSubmitHandler";
import { EventReportFormData } from "@/types/eventReport";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const form = useForm<EventReportFormData>({
    defaultValues: {
      program_name: '',
      report_name: '',
      report_text: '',
      detailed_description: '',
      activity_duration: '',
      attendees_count: '',
      activity_objectives: '',
      impact_on_participants: '',
      photos: Array(6).fill({ url: '', description: '' })
    }
  });

  const onSubmit = async (data: EventReportFormData) => {
    try {
      await submitReport(data, eventId, user?.id);
      onSuccess?.();
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ReportBasicFields form={form} />
        <ReportDetailsFields form={form} />
        <ReportMetadataFields form={form} />
        <ReportObjectivesFields form={form} />
        <PhotosField
          photos={form.watch('photos')}
          onPhotosChange={(photos) => form.setValue('photos', photos)}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
        </Button>
      </form>
    </Form>
  );
};