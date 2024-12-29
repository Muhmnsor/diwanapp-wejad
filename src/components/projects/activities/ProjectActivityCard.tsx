import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";
import { useQueryClient } from "@tanstack/react-query";
import { formatTime12Hour, formatDateWithDay } from "@/utils/dateTimeUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProjectActivityCardProps {
  projectActivity: {
    id: string;
    project_id: string;
    event: ProjectActivity;
  };
  onEdit: () => void;
  onDelete: () => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivityCard = ({ 
  projectActivity,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivityCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  console.log("ProjectActivityCard - Current activity:", projectActivity);

  const handleEditSuccess = async () => {
    console.log("ProjectActivityCard - Edit successful, calling onEditSuccess");
    await queryClient.invalidateQueries({ 
      queryKey: ['project-activities', projectActivity.project_id]
    });
    await onEditSuccess();
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden mb-4">
        <Table dir="rtl">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-right font-bold w-[200px]">عنوان النشاط</TableHead>
              <TableHead className="text-right font-bold w-[180px]">التاريخ والوقت</TableHead>
              <TableHead className="text-right font-bold w-[200px]">الموقع</TableHead>
              <TableHead className="text-right font-bold">الوصف</TableHead>
              <TableHead className="text-right font-bold">متطلبات خاصة</TableHead>
              <TableHead className="text-center font-bold w-[120px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium align-top">
                {projectActivity.event?.title}
              </TableCell>
              <TableCell className="align-top">
                <div>{formatDateWithDay(projectActivity.event?.date)}</div>
                <div className="text-muted-foreground">
                  {formatTime12Hour(projectActivity.event?.time)}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div>{projectActivity.event?.location}</div>
                {projectActivity.event?.location_url && (
                  <a
                    href={projectActivity.event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline mt-1"
                  >
                    رابط الموقع
                  </a>
                )}
              </TableCell>
              <TableCell className="max-w-[300px] align-top">
                <div className="line-clamp-3">
                  {projectActivity.event?.description}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] align-top">
                <div className="line-clamp-2">
                  {projectActivity.event?.special_requirements}
                </div>
              </TableCell>
              <TableCell className="align-top">
                <div className="flex items-center justify-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsEditDialogOpen(true)}
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
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <EditActivityDialog
        activity={projectActivity}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleEditSuccess}
        projectId={projectActivity.project_id}
      />
    </>
  );
};