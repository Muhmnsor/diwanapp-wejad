import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, MapPin, Calendar, Clock } from "lucide-react";
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
    <Card className="p-6 hover:shadow-md transition-all duration-200">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg font-semibold text-gray-900">{activity.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{activity.date}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{activity.time}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 hover:bg-secondary/80"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 hover:bg-secondary/80"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            <span className="text-sm">{activity.location}</span>
          </div>
          
          {activity.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {activity.description}
            </p>
          )}
          
          {activity.special_requirements && (
            <div className="text-sm bg-secondary/30 p-3 rounded-lg">
              <span className="font-medium text-primary">احتياجات خاصة: </span>
              {activity.special_requirements}
            </div>
          )}
          
          {activity.location_url && (
            <a
              href={activity.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              <MapPin className="h-4 w-4" />
              رابط الموقع
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};