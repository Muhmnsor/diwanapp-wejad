
import { Card } from "@/components/ui/card";
import { ActivityListHeader } from "@/components/projects/activities/list/ActivityListHeader";
import { ProjectActivitiesList } from "@/components/projects/dashboard/ProjectActivitiesList";
import { useActivityManagement } from "@/components/projects/activities/hooks/useActivityManagement";
import { useProjectActivities } from "@/hooks/dashboard/useProjectActivities";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  console.log('DashboardActivitiesTab - projectId:', projectId);
  
  const { projectActivities, refetchActivities } = useProjectActivities(projectId);

  const handleRefetch = async () => {
    await refetchActivities();
  };

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
  } = useActivityManagement(projectId, handleRefetch);

  return (
    <div className="space-y-6">
      <ActivityListHeader 
        projectId={projectId}
        onSuccess={handleRefetch}
      />

      <Card className="p-6">
        <ProjectActivitiesList
          projectActivities={projectActivities}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onEditSuccess={handleRefetch}
        />
      </Card>
    </div>
  );
};
