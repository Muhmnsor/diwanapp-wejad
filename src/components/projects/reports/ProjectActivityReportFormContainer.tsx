import { ProjectActivityReportForm } from "./ProjectActivityReportForm";

interface ProjectActivityReportFormContainerProps {
  projectId: string;
  activityId: string;
  onSuccess?: () => void;
}

export const ProjectActivityReportFormContainer = ({
  projectId,
  activityId,
  onSuccess,
}: ProjectActivityReportFormContainerProps) => {
  return (
    <div className="space-y-6">
      <ProjectActivityReportForm
        projectId={projectId}
        activityId={activityId}
        onSuccess={onSuccess}
      />
    </div>
  );
};