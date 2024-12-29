import { Card, CardContent } from "@/components/ui/card";
import { ProjectDashboardHeader } from "./ProjectDashboardHeader";
import { ProjectActivitiesList } from "./ProjectActivitiesList";
import { ActivityDialogsContainer } from "../activities/containers/ActivityDialogsContainer";
import { useActivityManagement } from "../activities/hooks/useActivityManagement";
import { useQueryClient } from "@tanstack/react-query";

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
  console.log("ProjectActivitiesTab - Initial render with activities:", projectActivities);
  const queryClient = useQueryClient();

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

  const handleEditSuccess = async () => {
    console.log("ProjectActivitiesTab - Handling edit success");
    await refetchActivities();
    await queryClient.invalidateQueries({ 
      queryKey: ['project-activities', project.id] 
    });
    console.log("ProjectActivitiesTab - Queries invalidated and activities refetched");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <ProjectDashboardHeader onAddEvent={handleAddEvent} />
        <ProjectActivitiesList
          projectActivities={projectActivities}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onEditSuccess={handleEditSuccess}
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
          refetchActivities={handleEditSuccess}
          confirmDelete={confirmDelete}
          project={project}
        />
      </CardContent>
    </Card>
  );
};