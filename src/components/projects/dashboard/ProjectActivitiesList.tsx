import { ProjectActivity } from "@/types/activity";
import { ProjectActivityCard } from "./ProjectActivityCard";

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

  if (!projectActivities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectActivities.map((activity) => (
        <ProjectActivityCard
          key={activity.id}
          activity={activity}
          onEdit={() => onEdit(activity)}
          onDelete={() => onDelete(activity)}
          onEditSuccess={onEditSuccess}
        />
      ))}
    </div>
  );
};