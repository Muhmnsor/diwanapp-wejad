import { ProjectActivitiesTable } from "../activities/ProjectActivitiesTable";
import { ProjectActivity } from "@/types/activity";

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
    <div className="space-y-4">
      <ProjectActivitiesTable
        activities={projectActivities}
        onEdit={onEdit}
        onDelete={onDelete}
        onEditSuccess={onEditSuccess}
      />
    </div>
  );
};