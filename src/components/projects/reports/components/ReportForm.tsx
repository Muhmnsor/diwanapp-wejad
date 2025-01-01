import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { ReportFormFields } from "./form/ReportFormFields";
import { ReportFormActions } from "./form/ReportFormActions";
import { ReportFormData } from "../types/reportTypes";

interface ReportFormProps {
  projectId: string;
  activityId: string;
  onSuccess?: () => void;
}

export const ReportForm = ({
  projectId,
  activityId,
  onSuccess,
}: ReportFormProps) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ReportFormData>({
    reportName: "",
    programName: "",
    reportText: "",
    detailedDescription: "",
    activityDuration: "",
    attendeesCount: "",
    activityObjectives: "",
    impactOnParticipants: "",
    photos: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reportName || !formData.reportText) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    if (!user?.id) {
      toast.error("يجب تسجيل الدخول لإضافة تقرير");
      return;
    }

    console.log("Verifying activity and submitting report:", {
      projectId,
      activityId,
      executorId: user.id,
      ...formData
    });
    
    setIsSubmitting(true);

    try {
      // First verify that the activity exists and belongs to the project
      const { data: activity, error: activityError } = await supabase
        .from('events')
        .select('id')
        .eq('id', activityId)
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .maybeSingle();

      if (activityError) {
        console.error('Error verifying activity:', activityError);
        toast.error("حدث خطأ أثناء التحقق من النشاط");
        return;
      }

      if (!activity) {
        console.error('Activity not found or does not belong to project:', { activityId, projectId });
        toast.error("لم يتم العثور على النشاط المحدد");
        return;
      }

      // Now insert the report
      const { data: report, error: insertError } = await supabase
        .from('project_activity_reports')
        .insert({
          project_id: projectId,
          activity_id: activityId,
          executor_id: user.id,
          program_name: formData.programName,
          report_name: formData.reportName,
          report_text: formData.reportText,
          detailed_description: formData.detailedDescription,
          activity_duration: formData.activityDuration,
          attendees_count: formData.attendeesCount,
          activity_objectives: formData.activityObjectives,
          impact_on_participants: formData.impactOnParticipants,
          photos: formData.photos.filter(photo => photo.url),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error submitting report:', insertError);
        toast.error("حدث خطأ أثناء حفظ التقرير");
        return;
      }

      console.log('Report submitted successfully:', report);
      toast.success("تم إضافة التقرير بنجاح");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ReportFormFields
        formData={formData}
        onChange={setFormData}
      />
      <ReportFormActions
        isSubmitting={isSubmitting}
      />
    </form>
  );
};