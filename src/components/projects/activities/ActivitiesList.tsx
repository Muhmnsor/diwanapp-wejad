import { ActivityCard } from "./ActivityCard";

interface ActivitiesListProps {
  activities: any[];
  onEditActivity: (activity: any) => void;
  onDeleteActivity: (activity: any) => void;
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
    <div className="space-y-4">
      {activities.map((activity: any) => (
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