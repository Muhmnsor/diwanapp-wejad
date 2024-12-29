import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditActivityDialog } from "../activities/dialogs/EditActivityDialog";

interface ProjectActivityCardProps {
  projectActivity: {
    id: string;
    project_id: string;
    event: ProjectActivity;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectActivityCard = ({ 
  projectActivity,
  onEdit,
  onDelete
}: ProjectActivityCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivityCard - projectActivity:", projectActivity);

  const handleEditClick = () => {
    onEdit();
  };

  return (
    <>
      <Card key={projectActivity.id} className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{projectActivity.event?.title}</h4>
              <p className="text-sm text-muted-foreground">
                {projectActivity.event?.date} - {projectActivity.event?.time}
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
            {projectActivity.event?.location}
          </div>
          {projectActivity.event?.description && (
            <p className="text-sm text-gray-600">
              {projectActivity.event.description}
            </p>
          )}
          {projectActivity.event?.special_requirements && (
            <div className="text-sm">
              <span className="font-medium">احتياجات خاصة: </span>
              {projectActivity.event.special_requirements}
            </div>
          )}
          {projectActivity.event?.location_url && (
            <a
              href={projectActivity.event.location_url}
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
          activity={projectActivity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={onEdit}
          projectId={projectActivity.project_id}
        />
      )}
    </>
  );
};