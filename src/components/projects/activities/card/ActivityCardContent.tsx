import { ProjectActivity } from "@/types/activity";

interface ActivityCardContentProps {
  activity: ProjectActivity;
}

export const ActivityCardContent = ({ activity }: ActivityCardContentProps) => {
  return (
    <>
      <div className="text-sm text-muted-foreground">
        {activity.location}
      </div>
      {activity.description && (
        <p className="text-sm text-gray-600">
          {activity.description}
        </p>
      )}
      {activity.special_requirements && (
        <div className="text-sm">
          <span className="font-medium">احتياجات خاصة: </span>
          {activity.special_requirements}
        </div>
      )}
      {activity.location_url && (
        <a
          href={activity.location_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          رابط الموقع
        </a>
      )}
    </>
  );
};