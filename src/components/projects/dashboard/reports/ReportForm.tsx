
import { Card } from "@/components/ui/card";
import { ReportFormFields } from "./ReportFormFields";
import { useReportForm } from "@/hooks/reports/useReportForm";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReportFormProps {
  projectId: string;
  report?: any;
  onSuccess?: () => void;
}

export const ReportForm = ({ projectId, report, onSuccess }: ReportFormProps) => {
  const {
    selectedActivity,
    setSelectedActivity,
    photos,
    setPhotos,
    formData,
    setFormData,
    project,
    activities,
    attendanceCount,
    selectedActivityDetails,
    handleSubmit: onSubmit,
  } = useReportForm(projectId, report, onSuccess);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found');
      return;
    }
    
    // Add the author_id to the form data
    await onSubmit(e, user.id);
  }, [onSubmit]);

  console.log('ReportForm - Current photos:', photos);
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ReportFormFields
          project={project}
          activities={activities}
          selectedActivity={selectedActivity}
          setSelectedActivity={setSelectedActivity}
          formData={formData}
          setFormData={setFormData}
          attendanceCount={attendanceCount}
          selectedActivityDetails={selectedActivityDetails}
          photos={photos}
          setPhotos={setPhotos}
        />
      </form>
    </Card>
  );
};
