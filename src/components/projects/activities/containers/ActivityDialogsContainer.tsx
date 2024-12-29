import { AddActivityDialog } from "../dialogs/AddActivityDialog";
import { EditProjectEventDialog } from "../../events/EditProjectEventDialog";
import { DeleteActivityDialog } from "../dialogs/DeleteActivityDialog";

interface ActivityDialogsContainerProps {
  projectId: string;
  selectedEvent: any;
  isAddEventOpen: boolean;
  isEditEventOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsAddEventOpen: (open: boolean) => void;
  setIsEditEventOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  refetchActivities: () => void;
  confirmDelete: () => void;
  project: {
    event_path: string;
    event_category: string;
  };
}

export const ActivityDialogsContainer = ({
  projectId,
  selectedEvent,
  isAddEventOpen,
  isEditEventOpen,
  isDeleteDialogOpen,
  setIsAddEventOpen,
  setIsEditEventOpen,
  setIsDeleteDialogOpen,
  refetchActivities,
  confirmDelete,
  project,
}: ActivityDialogsContainerProps) => {
  return (
    <>
      <AddActivityDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        projectId={projectId}
        onSuccess={refetchActivities}
        project={project}
      />

      {selectedEvent && (
        <>
          <EditProjectEventDialog
            activity={selectedEvent}
            open={isEditEventOpen}
            onOpenChange={setIsEditEventOpen}
            onSave={refetchActivities}
            projectId={projectId}
          />

          <DeleteActivityDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </>
  );
};