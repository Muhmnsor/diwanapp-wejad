
import { ProjectActivity } from "@/types/activity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { EditActivityDialog } from "../activities/dialogs/EditActivityDialog";
import { DeleteActivityDialog } from "../activities/dialogs/DeleteActivityDialog";
import { useState } from "react";
import { handleActivityDelete } from "../activities/card/ActivityDeleteHandler";

interface ProjectActivitiesListProps {
  projectActivities: ProjectActivity[];
  onEdit: (activity: ProjectActivity) => void;
  onDelete: (activity: ProjectActivity) => void;
  onEditSuccess: () => Promise<void>;
}

export const ProjectActivitiesList = ({
  projectActivities,
  onEdit,
  onDelete,
  onEditSuccess
}: ProjectActivitiesListProps) => {
  const [selectedActivity, setSelectedActivity] = useState<ProjectActivity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivitiesList - activities:", projectActivities);

  if (!projectActivities.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد أنشطة مضافة
      </div>
    );
  }

  const handleEditClick = (activity: ProjectActivity) => {
    setSelectedActivity(activity);
    setIsEditDialogOpen(true);
    onEdit(activity);
  };

  const handleDeleteClick = (activity: ProjectActivity) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    
    setIsLoading(true);
    const success = await handleActivityDelete(selectedActivity.id);
    if (success) {
      onDelete(selectedActivity);
      setIsDeleteDialogOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">النشاط</TableHead>
            <TableHead className="font-bold">التاريخ</TableHead>
            <TableHead className="font-bold">الوقت</TableHead>
            <TableHead className="font-bold">المكان</TableHead>
            <TableHead className="font-bold">ساعات النشاط</TableHead>
            <TableHead className="font-bold text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">{activity.title}</TableCell>
              <TableCell>{activity.date}</TableCell>
              <TableCell>{activity.time}</TableCell>
              <TableCell>{activity.location}</TableCell>
              <TableCell>{activity.event_hours}</TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(activity)}
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteClick(activity)}
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedActivity && isEditDialogOpen && (
        <EditActivityDialog
          activity={selectedActivity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onEditSuccess}
          projectId={selectedActivity.project_id}
        />
      )}

      <DeleteActivityDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
