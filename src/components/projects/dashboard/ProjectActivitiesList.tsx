import { ProjectActivityCard } from "../activities/ProjectActivityCard";
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

  if (!projectActivities || projectActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectActivities.map((activity: ProjectActivity) => (
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