import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";

interface DashboardActivitiesTabProps {
  projectId: string;
}

export const DashboardActivitiesTab = ({ projectId }: DashboardActivitiesTabProps) => {
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <ProjectActivitiesTab
      projectId={projectId}
      activityId={projectActivities[0]?.id}
    />
  );
};