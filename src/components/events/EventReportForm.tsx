import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ReportNameField } from "./reports/form/ReportNameField";
import { ReportTextField } from "./reports/form/ReportTextField";
import { DetailedDescriptionField } from "./reports/form/DetailedDescriptionField";
import { EventMetadataFields } from "./reports/form/EventMetadataFields";
import { EventObjectivesField } from "./reports/form/EventObjectivesField";
import { ImpactField } from "./reports/form/ImpactField";
import { PhotosField } from "./reports/form/PhotosField";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

interface PhotoWithDescription {
  url: string;
  description: string;
}

interface ReportFormData {
  report_name: string;
  report_text: string;
  detailed_description: string;
  event_duration: string;
  attendees_count: string;
  event_objectives: string;
  impact_on_participants: string;
  photos: PhotoWithDescription[];
}

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<ReportFormData>({
    defaultValues: {
      photos: Array(6).fill({ url: '', description: '' })
    }
  });

  const formValues = watch();

  const onSubmit = async (data: ReportFormData) => {
    try {
      console.log('Submitting report with data:', { ...data, eventId, executorId: user?.id });
      
      const { error } = await supabase
        .from('event_reports')
        .insert([
          {
            event_id: eventId,
            executor_id: user?.id,
            report_name: data.report_name,
            report_text: data.report_text,
            detailed_description: data.detailed_description,
            event_duration: data.event_duration,
            attendees_count: data.attendees_count,
            event_objectives: data.event_objectives,
            impact_on_participants: data.impact_on_participants,
            photos: data.photos.filter(photo => photo.url),
          }
        ]);

      if (error) throw error;

      console.log('Report submitted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("حدث خطأ أثناء إرسال التقرير");
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ReportNameField
        value={formValues.report_name}
        onChange={(value) => setValue('report_name', value)}
      />

      <ReportTextField
        value={formValues.report_text}
        onChange={(value) => setValue('report_text', value)}
      />

      <DetailedDescriptionField
        value={formValues.detailed_description}
        onChange={(value) => setValue('detailed_description', value)}
      />

      <EventMetadataFields
        duration={formValues.event_duration}
        attendeesCount={formValues.attendees_count}
        onDurationChange={(value) => setValue('event_duration', value)}
        onAttendeesCountChange={(value) => setValue('attendees_count', value)}
      />

      <EventObjectivesField
        value={formValues.event_objectives}
        onChange={(value) => setValue('event_objectives', value)}
      />

      <ImpactField
        value={formValues.impact_on_participants}
        onChange={(value) => setValue('impact_on_participants', value)}
      />

      <PhotosField
        photos={formValues.photos}
        onPhotosChange={(photos) => setValue('photos', photos)}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};