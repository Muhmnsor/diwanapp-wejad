import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivitiesList } from "@/components/projects/activities/ActivitiesList";
import { ActivityListHeader } from "@/components/projects/activities/list/ActivityListHeader";
import { ActivityDialogsContainer } from "@/components/projects/activities/containers/ActivityDialogsContainer";
import { useActivityManagement } from "@/components/projects/activities/hooks/useActivityManagement";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  const { data: activities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }

      console.log('Fetched activities:', data);
      return data || [];
    },
  });

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
  } = useActivityManagement(projectId, async () => {
    await refetchActivities();
  });

  const project = {
    event_path: 'environment',
    event_category: 'social'
  };

  return (
    <div className="space-y-6">
      <ActivityListHeader onAddActivity={handleAddEvent} />

      <Card className="p-6">
        <ActivitiesList
          activities={activities}
          onEditActivity={handleEditEvent}
          onDeleteActivity={handleDeleteEvent}
        />
      </Card>

      <ActivityDialogsContainer
        projectId={projectId}
        selectedEvent={selectedEvent}
        isAddEventOpen={isAddEventOpen}
        isEditEventOpen={isEditEventOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsAddEventOpen={setIsAddEventOpen}
        setIsEditEventOpen={setIsEditEventOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        refetchActivities={async () => {
          await refetchActivities();
        }}
        confirmDelete={confirmDelete}
        project={project}
      />
    </div>
  );
};