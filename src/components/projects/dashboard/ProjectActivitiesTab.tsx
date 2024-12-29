import { Card, CardContent } from "@/components/ui/card";
import { ProjectDashboardHeader } from "./ProjectDashboardHeader";
import { ProjectActivitiesList } from "./ProjectActivitiesList";
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
    <Card>
      <CardContent className="pt-6">
        <ProjectDashboardHeader onAddEvent={handleAddEvent} />
        <ProjectActivitiesList
          projectActivities={projectActivities}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />

        <ActivityDialogsContainer
          projectId={project.id}
          selectedEvent={selectedEvent}
          isAddEventOpen={isAddEventOpen}
          setIsAddEventOpen={setIsAddEventOpen}
          isEditEventOpen={isEditEventOpen}
          setIsEditEventOpen={setIsEditEventOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          refetchActivities={refetchActivities}
          confirmDelete={confirmDelete}
          project={project}
        />
      </CardContent>
    </Card>
  );
};