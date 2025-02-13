
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
      <Card className="group transition-all duration-200 hover:shadow-lg">
        <div className="p-4 space-y-4">
          <ActivityCardHeader
            activity={activity}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            className="pb-4 border-b"
          />
          <div className="bg-muted/20 rounded-lg p-4">
            <ActivityCardContent 
              activity={activity} 
              className="space-y-3"
            />
          </div>
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
