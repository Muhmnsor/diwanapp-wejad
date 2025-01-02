import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivity } from "@/types/activity";
import { useQueryClient } from "@tanstack/react-query";
import { ReportFormFields } from "./form/ReportFormFields";
import { ReportFormActions } from "./form/ReportFormActions";

interface ProjectReportFormProps {
  projectId: string;
  activityId: string;
  projectTitle: string;
  activities: ProjectActivity[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectReportForm = ({
  projectId,
  activityId,
  projectTitle,
  activities,
  onSuccess,
  onCancel
}: ProjectReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportName, setReportName] = useState("");
  const [programName, setProgramName] = useState(projectTitle);
  const [reportText, setReportText] = useState("");
  const [activityDuration, setActivityDuration] = useState("");
  const [attendeesCount, setAttendeesCount] = useState("");
  const [activityObjectives, setActivityObjectives] = useState("");
  const [impactOnParticipants, setImpactOnParticipants] = useState("");
  const [photos, setPhotos] = useState<{ url: string; description: string; }[]>([]);
  
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportName || !reportText) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .insert({
          project_id: projectId,
          activity_id: activityId,
          program_name: programName,
          report_name: reportName,
          report_text: reportText,
          activity_duration: activityDuration,
          attendees_count: attendeesCount,
          activity_objectives: activityObjectives,
          impact_on_participants: impactOnParticipants,
          photos: photos,
        });

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ['project-activity-reports', projectId]
      });
      await queryClient.invalidateQueries({
        queryKey: ['project-activity-reports', activityId]
      });

      toast.success("تم إضافة التقرير بنجاح");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ReportFormFields
        reportName={reportName}
        programName={programName}
        reportText={reportText}
        activityDuration={activityDuration}
        attendeesCount={attendeesCount}
        activityObjectives={activityObjectives}
        impactOnParticipants={impactOnParticipants}
        photos={photos}
        activities={activities}
        onReportNameChange={setReportName}
        onProgramNameChange={setProgramName}
        onReportTextChange={setReportText}
        onActivityDurationChange={setActivityDuration}
        onAttendeesCountChange={setAttendeesCount}
        onActivityObjectivesChange={setActivityObjectives}
        onImpactChange={setImpactOnParticipants}
        onPhotosChange={setPhotos}
      />
      
      <ReportFormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
};