import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivitiesList } from "@/components/projects/activities/ActivitiesList";
import { ActivityListHeader } from "@/components/projects/activities/list/ActivityListHeader";

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

  return (
    <div className="space-y-6">
      <ActivityListHeader 
        projectId={projectId}
        onSuccess={refetchActivities}
      />

      <Card className="p-6">
        <ActivitiesList
          activities={activities}
          onEditActivity={() => {}}
          onDeleteActivity={() => {}}
        />
      </Card>
    </div>
  );
};