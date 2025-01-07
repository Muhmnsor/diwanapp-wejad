import { ActivityCard } from "./ActivityCard";
import { ProjectActivity } from "@/types/activity";

interface ActivitiesListProps {
  activities: ProjectActivity[];
  onEditActivity: (activity: ProjectActivity) => void;
  onDeleteActivity: (activity: ProjectActivity) => void;
}

export const ActivitiesList = ({ 
  activities,
  onEditActivity,
  onDeleteActivity
}: ActivitiesListProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد أنشطة مضافة لهذا المشروع
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEdit={() => onEditActivity(activity)}
          onDelete={() => onDeleteActivity(activity)}
        />
      ))}
    </div>
  );
};