import { ProjectDashboardHeader } from "./ProjectDashboardHeader";
import { ActivitiesList } from "../activities/ActivitiesList";
import { ActivityDialogsContainer } from "../activities/containers/ActivityDialogsContainer";
import { useActivityManagement } from "../activities/hooks/useActivityManagement";

interface ProjectActivitiesTabProps {
  project: {
    id: string;
    event_path: string;
    event_category: string;
  };
  projectActivities: any[];
  refetchActivities: () => void;
}

export const ProjectActivitiesTab = ({
  project,
  projectActivities,
  refetchActivities
}: ProjectActivitiesTabProps) => {
  const {
    selectedEvent,
    isAddEventOpen,
    setIsAddEventOpen,
    isEditEventOpen,
    setIsEditEventOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    confirmDelete,
  } = useActivityManagement(project.id, refetchActivities);

  return (
    <div className="space-y-6">
      <ProjectDashboardHeader onAddEvent={handleAddEvent} />
      
      <ActivitiesList
        activities={projectActivities.map((pa: any) => pa.event)}
        onEditActivity={handleEditEvent}
        onDeleteActivity={handleDeleteEvent}
      />

      <ActivityDialogsContainer
        projectId={project.id}
        selectedEvent={selectedEvent}
        isAddEventOpen={isAddEventOpen}
        isEditEventOpen={isEditEventOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsAddEventOpen={setIsAddEventOpen}
        setIsEditEventOpen={setIsEditEventOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        refetchActivities={refetchActivities}
        confirmDelete={confirmDelete}
        project={project}
      />
    </div>
  );
};