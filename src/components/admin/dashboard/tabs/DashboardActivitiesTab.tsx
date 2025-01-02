import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  console.log('DashboardActivitiesTab - projectId:', projectId);

  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      console.log('Fetching project activities for project:', projectId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching project activities:', error);
        throw error;
      }
      
      console.log('Fetched activities:', data);
      return data || [];
    },
    enabled: !!projectId, // Only run query when projectId exists
  });

  return (
    <ProjectActivitiesTab
      projectId={projectId}
      activityId={projectActivities[0]?.id}
    />
  );
};