import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EditActivityDialog } from "./dialogs/EditActivityDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <Card className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-medium">{activity.title}</h4>
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الحقل</TableHead>
              <TableHead>القيمة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">التاريخ والوقت</TableCell>
              <TableCell>{activity.date} - {activity.time}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">الموقع</TableCell>
              <TableCell>{activity.location}</TableCell>
            </TableRow>
            {activity.description && (
              <TableRow>
                <TableCell className="font-medium">الوصف</TableCell>
                <TableCell>{activity.description}</TableCell>
              </TableRow>
            )}
            {activity.special_requirements && (
              <TableRow>
                <TableCell className="font-medium">احتياجات خاصة</TableCell>
                <TableCell>{activity.special_requirements}</TableCell>
              </TableRow>
            )}
            {activity.location_url && (
              <TableRow>
                <TableCell className="font-medium">رابط الموقع</TableCell>
                <TableCell>
                  <a
                    href={activity.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    رابط الموقع
                  </a>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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