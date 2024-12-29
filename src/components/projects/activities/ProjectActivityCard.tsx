import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditProjectActivityDialog } from "./EditProjectActivityDialog";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  onDelete,
}: ProjectActivityCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivityCard - projectActivity:", projectActivity);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {projectActivity.event.title}
              </h3>
              <p className="text-sm text-gray-500">
                {projectActivity.event.description}
              </p>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEditClick}
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
                      variant="ghost"
                      size="icon"
                      onClick={onDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حذف النشاط</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">التاريخ:</span>{" "}
              {projectActivity.event.date}
            </div>
            <div>
              <span className="font-medium">الوقت:</span>{" "}
              {projectActivity.event.time}
            </div>
            <div>
              <span className="font-medium">المكان:</span>{" "}
              {projectActivity.event.location}
            </div>
            <div>
              <span className="font-medium">عدد الساعات:</span>{" "}
              {projectActivity.event.event_hours}
            </div>
          </div>
        </div>
      </Card>

      <EditProjectActivityDialog
        activity={projectActivity.event}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onEdit}
        projectId={projectActivity.project_id}
      />
    </>
  );
};