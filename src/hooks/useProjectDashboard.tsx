
import { useProjectActivities } from "./dashboard/useProjectActivities";
import { useProjectRegistrations } from "./dashboard/useProjectRegistrations";
import { useProjectDetails } from "./dashboard/useProjectDetails";
import { useProjectMetrics } from "./dashboard/useProjectMetrics";

export const useProjectDashboard = (projectId: string) => {
  const { projectActivities, refetchActivities } = useProjectActivities(projectId);
  const { registrations, isRegistrationsLoading } = useProjectRegistrations(projectId);
  const { projectData, isProjectLoading } = useProjectDetails(projectId);
  
  const metrics = useProjectMetrics(projectData, registrations, projectActivities);

  const isLoading = isProjectLoading || isRegistrationsLoading;

  return {
    projectActivities,
    refetchActivities,
    metrics,
    isLoading
  };
};
