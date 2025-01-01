import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { ReportFormFields } from "@/components/events/reports/form/ReportFormFields";

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

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">إضافة تقرير جديد</h2>
      
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