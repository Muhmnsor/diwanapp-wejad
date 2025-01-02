import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityListHeader } from "@/components/projects/activities/list/ActivityListHeader";
import { ProjectActivitiesList } from "@/components/projects/dashboard/ProjectActivitiesList";
import { useActivityManagement } from "@/components/projects/activities/hooks/useActivityManagement";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  console.log('DashboardActivitiesTab - projectId:', projectId);
  
  const { data: activities = [], refetch: refetchActivities, isLoading } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities:', projectId);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("project_id", projectId)
        .eq("is_project_activity", true)
        .order("date", { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        throw error;
      }
      
      console.log('Fetched activities:', data);
      return data || [];
    },
    enabled: !!projectId, // Only run query when projectId exists
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ActivityListHeader 
          projectId={projectId}
          onSuccess={handleRefetch}
        />
        <Card className="p-6">
          <div className="text-center py-4">جاري التحميل...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActivityListHeader 
        projectId={projectId}
        onSuccess={handleRefetch}
      />

      <Card className="p-6">
        <ProjectActivitiesList
          projectActivities={activities}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onEditSuccess={handleRefetch}
        />
      </Card>
    </div>
  );
};