import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditProjectActivityDialog } from "./EditProjectActivityDialog";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime12Hour } from "@/utils/dateTimeUtils";

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
            <h3 className="text-lg font-semibold">
              {projectActivity.event.title}
            </h3>
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

          {projectActivity.event.description && (
            <p className="text-sm text-gray-500">
              {projectActivity.event.description}
            </p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>المكان</TableHead>
                <TableHead>عدد الساعات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{projectActivity.event.date}</TableCell>
                <TableCell>{formatTime12Hour(projectActivity.event.time)}</TableCell>
                <TableCell>{projectActivity.event.location}</TableCell>
                <TableCell>{projectActivity.event.event_hours}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
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