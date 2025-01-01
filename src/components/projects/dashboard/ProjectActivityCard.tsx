import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ProjectActivity } from "@/types/activity";
import { EditActivityDialog } from "../activities/dialogs/EditActivityDialog";
import { DeleteActivityDialog } from "../activities/dialogs/DeleteActivityDialog";
import { ActivityCardHeader } from "../activities/card/ActivityCardHeader";
import { ActivityCardContent } from "../activities/card/ActivityCardContent";
import { handleActivityDelete } from "../activities/card/ActivityDeleteHandler";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log("ProjectActivityCard - activity:", activity);

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
    onEdit();
  };

  const handleDeleteClick = () => {
    console.log("Opening delete dialog for activity:", activity.id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    const success = await handleActivityDelete(activity.id);
    if (success) {
      onDelete();
      setIsDeleteDialogOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Card className="p-4">
        <div className="space-y-2">
          <ActivityCardHeader
            activity={activity}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
          <ActivityCardContent activity={activity} />
        </div>
      </Card>

      {isEditDialogOpen && (
        <EditActivityDialog
          activity={activity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onEditSuccess}
          projectId={activity.project_id}
        />
      )}

      <DeleteActivityDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};