import { ProjectActivity } from "@/types/activity";
import { ProjectActivitiesTable } from "../activities/ProjectActivitiesTable";

interface ProjectActivitiesListProps {
  projectActivities: ProjectActivity[];
  onEdit: (activity: ProjectActivity) => void;
  onDelete: (activity: ProjectActivity) => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivitiesListProps) => {
  console.log("ProjectActivitiesList - activities:", projectActivities);

  return (
    <ProjectActivitiesTable
      activities={projectActivities}
      onEdit={onEdit}
      onDelete={onDelete}
      onEditSuccess={onEditSuccess}
    />
  );
};