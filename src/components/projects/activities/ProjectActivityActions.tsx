import { Button } from "@/components/ui/button";
import { Edit2, FileText, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProjectActivity } from "@/types/activity";
import { useState } from "react";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";
import { ProjectActivityReportDialog } from "../reports/ProjectActivityReportDialog";

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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = () => {
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
                onClick={() => setIsReportDialogOpen(true)}
                className="h-8 w-8 transition-colors hover:bg-secondary"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>إضافة تقرير</p>
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
          activity={{
            id: activity.id,
            project_id: activity.project_id,
            event: activity
          }}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={onEditSuccess}
          projectId={activity.project_id}
        />
      )}

      <ProjectActivityReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        projectId={activity.project_id}
        activityId={activity.id}
      />
    </>
  );
};