import { Card, CardContent } from "@/components/ui/card";
import { ProjectActivityCard } from "./ProjectActivityCard";

interface ProjectActivitiesListProps {
  projectActivities: any[];
  onEditActivity: (activity: any) => void;
  onDeleteActivity: (activity: any) => void;
}

export const ProjectActivitiesList = ({ 
  projectActivities,
  onEditActivity,
  onDeleteActivity
}: ProjectActivitiesListProps) => {
  if (projectActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projectActivities.map((projectActivity: any) => (
        <ProjectActivityCard
          key={projectActivity.id}
          projectActivity={projectActivity}
          onEdit={() => onEditActivity(projectActivity)}
          onDelete={() => onDeleteActivity(projectActivity)}
        />
      ))}
    </div>
  );
};