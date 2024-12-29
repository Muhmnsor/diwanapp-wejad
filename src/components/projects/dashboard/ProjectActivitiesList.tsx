import { ProjectActivityCard } from "./ProjectActivityCard";

interface ProjectActivitiesListProps {
  projectActivities: any[];
  onEdit: (event: any) => void;
  onDelete: (event: any) => void;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
}: ProjectActivitiesListProps) => {
  console.log('Rendering activities list with:', projectActivities);
  
  if (!projectActivities?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        لا توجد أنشطة مضافة بعد
      </div>
    );
  }

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