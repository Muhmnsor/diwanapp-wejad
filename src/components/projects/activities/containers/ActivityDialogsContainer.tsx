import { AddProjectEventDialog } from "@/components/projects/events/AddProjectEventDialog";
import { EditProjectActivityDialog } from "@/components/projects/activities/EditProjectActivityDialog";
import { DeleteActivityDialog } from "../dialogs/DeleteActivityDialog";
import { ProjectActivity } from "@/types/activity";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityDialogsContainerProps {
  projectId: string;
  selectedEvent: any;
  isAddEventOpen: boolean;
  setIsAddEventOpen: (open: boolean) => void;
  isEditEventOpen: boolean;
  setIsEditEventOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  refetchActivities: () => void;
  confirmDelete: () => void;
}

export const ActivityDialogsContainer = ({
  projectId,
  selectedEvent,
  isAddEventOpen,
  setIsAddEventOpen,
  isEditEventOpen,
  setIsEditEventOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  refetchActivities,
  confirmDelete,
}: ActivityDialogsContainerProps) => {
  return (
    <>
      <AddProjectEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        projectId={projectId}
        onSuccess={refetchActivities}
        project={{ event_path: "", event_category: "" }}
      />

      {selectedEvent && (
        <EditProjectActivityDialog
          activity={selectedEvent.event as ProjectActivity}
          open={isEditEventOpen}
          onOpenChange={setIsEditEventOpen}
          onSave={async (updatedActivity: ProjectActivity) => {
            try {
              const { error } = await supabase
                .from('events')
                .update(updatedActivity)
                .eq('id', selectedEvent.event.id);

              if (error) throw error;

              toast.success('تم تحديث النشاط بنجاح');
              refetchActivities();
              setIsEditEventOpen(false);
            } catch (error) {
              console.error('Error updating event:', error);
              toast.error('حدث خطأ أثناء تحديث النشاط');
            }
          }}
          projectId={projectId}
        />
      )}

      <DeleteActivityDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </>
  );
};