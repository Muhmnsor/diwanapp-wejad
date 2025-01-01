import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ReportFormFields } from "@/components/events/reports/form/ReportFormFields";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectActivityReportFormProps {
  projectId: string;
  activityId: string;
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
  activity_duration: string;
  attendees_count: string;
  activity_objectives: string;
  impact_on_participants: string;
  photos: PhotoWithDescription[];
}

export const ProjectActivityReportForm = ({ 
  projectId, 
  activityId, 
  onSuccess 
}: ProjectActivityReportFormProps) => {
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
      console.log('Submitting project activity report:', { data, projectId, activityId });
      
      const { error } = await supabase
        .from('project_activity_reports')
        .insert([
          {
            project_id: projectId,
            activity_id: activityId,
            executor_id: user?.id,
            program_name: data.program_name,
            report_name: data.report_name,
            report_text: data.report_text,
            detailed_description: data.detailed_description,
            activity_duration: data.activity_duration,
            attendees_count: data.attendees_count,
            activity_objectives: data.activity_objectives,
            impact_on_participants: data.impact_on_participants,
            photos: data.photos.filter(photo => photo.url),
          }
        ]);

      if (error) throw error;

      toast.success('تم إضافة التقرير بنجاح');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('حدث خطأ أثناء إرسال التقرير');
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