import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { ProjectActivity } from "@/types/activity";

interface ActivityCardProps {
  activity: ProjectActivity;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityCard = ({ 
  activity,
  onEdit,
  onDelete
}: ActivityCardProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{activity.title}</h4>
            <p className="text-sm text-muted-foreground">
              {activity.date} - {activity.time}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
      </div>
    </Card>
  );
};