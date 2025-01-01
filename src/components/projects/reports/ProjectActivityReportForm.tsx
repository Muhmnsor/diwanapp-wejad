import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PhotosField } from "@/components/events/reports/form/PhotosField";
import { ReportNameField } from "@/components/events/reports/form/ReportNameField";
import { ReportTextField } from "@/components/events/reports/form/ReportTextField";
import { EventMetadataFields } from "@/components/events/reports/form/EventMetadataFields";
import { EventObjectivesField } from "@/components/events/reports/form/EventObjectivesField";
import { ImpactField } from "@/components/events/reports/form/ImpactField";
import { useAuthStore } from "@/store/authStore";

interface ProjectActivityReportFormProps {
  projectId: string;
  activityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ProjectActivityReportForm = ({
  projectId,
  activityId,
  onSuccess,
  onCancel
}: ProjectActivityReportFormProps) => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportName, setReportName] = useState("");
  const [programName, setProgramName] = useState("");
  const [reportText, setReportText] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [activityDuration, setActivityDuration] = useState("");
  const [attendeesCount, setAttendeesCount] = useState("");
  const [activityObjectives, setActivityObjectives] = useState("");
  const [impactOnParticipants, setImpactOnParticipants] = useState("");
  const [photos, setPhotos] = useState<{ url: string; description: string; }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportName || !reportText) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    if (!user?.id) {
      toast.error("يجب تسجيل الدخول لإضافة تقرير");
      return;
    }

    console.log("Submitting report:", {
      projectId,
      activityId,
      executorId: user.id,
      reportName,
      reportText
    });
    
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('project_activity_reports')
        .insert({
          project_id: projectId,
          activity_id: activityId,
          executor_id: user.id,
          program_name: programName,
          report_name: reportName,
          report_text: reportText,
          detailed_description: detailedDescription,
          activity_duration: activityDuration,
          attendees_count: attendeesCount,
          activity_objectives: activityObjectives,
          impact_on_participants: impactOnParticipants,
          photos: photos.filter(photo => photo.url),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Report submitted successfully:', data);
      toast.success("تم إضافة التقرير بنجاح");
      
      // Reset form
      setReportName("");
      setProgramName("");
      setReportText("");
      setDetailedDescription("");
      setActivityDuration("");
      setAttendeesCount("");
      setActivityObjectives("");
      setImpactOnParticipants("");
      setPhotos([]);
      
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
      <ReportNameField
        value={reportName}
        programName={programName}
        onChange={setReportName}
        onProgramNameChange={setProgramName}
      />

      <ReportTextField
        value={reportText}
        onChange={setReportText}
      />

      <EventMetadataFields
        duration={activityDuration}
        attendeesCount={attendeesCount}
        onDurationChange={setActivityDuration}
        onAttendeesCountChange={setAttendeesCount}
      />

      <EventObjectivesField
        value={activityObjectives}
        onChange={setActivityObjectives}
      />

      <ImpactField
        value={impactOnParticipants}
        onChange={setImpactOnParticipants}
      />

      <PhotosField
        photos={photos}
        onPhotosChange={setPhotos}
      />

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            إلغاء
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ التقرير"}
        </Button>
      </div>
    </form>
  );
};