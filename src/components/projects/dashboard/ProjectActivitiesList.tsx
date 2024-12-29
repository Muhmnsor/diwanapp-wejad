import { ProjectActivityCard } from "../activities/ProjectActivityCard";

interface ProjectActivitiesListProps {
  projectActivities: any[];
  onEdit: (activity: any) => void;
  onDelete: (activity: any) => void;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
}: ProjectActivitiesListProps) => {
  console.log("ProjectActivitiesList - activities:", projectActivities);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projectActivities.map((projectActivity) => (
        <ProjectActivityCard
          key={projectActivity.id}
          projectActivity={projectActivity}
          onEdit={() => onEdit(projectActivity)}
          onDelete={() => onDelete(projectActivity)}
        />
      ))}
    </div>
  );
};