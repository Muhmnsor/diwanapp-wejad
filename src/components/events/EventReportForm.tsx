import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ReportFormFields } from "./reports/form/ReportFormFields";
import { submitReport } from "./reports/form/ReportFormSubmitHandler";
import { ProjectActivity } from "@/types/activity";
import { EventReportFormData } from "@/types/eventReport";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const { user } = useAuthStore();
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<EventReportFormData>({
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

  const formValues = watch();
  const activities: ProjectActivity[] = [];

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ReportFormFields 
        formValues={formValues}
        setValue={setValue}
        activities={activities}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};