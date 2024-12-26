import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ReportFormFields } from "./reports/form/ReportFormFields";
import { submitReport } from "./reports/form/ReportFormSubmitHandler";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

interface PhotoWithDescription {
  url: string;
  description: string;
}

interface ReportFormData {
  program_name: string;
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
  const { handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<ReportFormData>({
    defaultValues: {
      program_name: '',
      report_name: '',
      photos: Array(6).fill({ url: '', description: '' })
    }
  });

  const formValues = watch();

  const onSubmit = async (data: ReportFormData) => {
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
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};