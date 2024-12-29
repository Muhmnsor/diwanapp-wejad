import { ActivityCard } from "./ActivityCard";

interface ActivitiesListProps {
  activities: Array<{
    id: string;
    title: string;
    date: string;
    location: string;
    image_url: string;
    event_type: "online" | "in-person";
    price: number | null;
    max_attendees?: number;
    registration_start_date?: string | null;
    registration_end_date?: string | null;
    beneficiary_type: string;
    certificate_type?: string;
    event_hours?: number;
    is_visible?: boolean;
  }>;
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
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          {...activity}
          onEdit={() => onEditActivity(activity)}
          onDelete={() => onDeleteActivity(activity)}
        />
      ))}
    </div>
  );
};