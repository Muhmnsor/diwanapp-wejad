import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectActivity } from "@/types/activity";
import { useState } from "react";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";

interface ProjectActivityActionsProps {
  activity: ProjectActivity;
  onEdit: () => void;
  onDelete: () => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivityActions = ({
  activity,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivityActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    onEdit();
  };

  return (
    <>
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8 transition-colors hover:bg-secondary"
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

      {isEditDialogOpen && (
        <EditActivityDialog
          activity={activity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onEditSuccess}
          projectId={activity.project_id}
        />
      )}
    </>
  );
};