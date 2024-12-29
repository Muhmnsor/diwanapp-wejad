import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";

interface ProjectActivityCardProps {
  activity: ProjectActivity;
  onEdit: () => void;
  onDelete: () => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivityCard = ({ 
  activity,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivityCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivityCard - activity:", activity);

  const handleEditClick = () => {
    onEdit();
  };

  return (
    <>
      <Card key={activity.id} className="p-4">
        <div className="space-y-2">
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
                      onClick={handleEditClick}
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

      {isEditDialogOpen && (
        <EditActivityDialog
          activity={activity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={onEditSuccess}
          projectId={activity.project_id}
        />
      )}
    </>
  );
};