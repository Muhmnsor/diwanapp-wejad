import { Card } from "@/components/ui/card";
import { ReportFormFields } from "./ReportFormFields";
import { useReportForm } from "@/hooks/reports/useReportForm";

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
    handleSubmit,
  } = useReportForm(projectId, report, onSuccess);

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