import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectActivity } from "@/types/activity";

interface ActivityCardHeaderProps {
  activity: ProjectActivity;
  isLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const ActivityCardHeader = ({
  activity,
  isLoading,
  onEdit,
  onDelete
}: ActivityCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{activity.title}</h4>
        <p className="text-sm text-muted-foreground">
          {activity.date} - {activity.time}
        </p>
      </div>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8 transition-colors hover:bg-secondary"
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>تعديل النشاط</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 transition-colors hover:bg-secondary"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>حذف النشاط</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};