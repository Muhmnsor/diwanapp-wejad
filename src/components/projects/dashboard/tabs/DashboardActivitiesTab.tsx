import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivitiesTab } from "@/components/projects/dashboard/ProjectActivitiesTab";

interface DashboardActivitiesTabProps {
  project: {
    id: string;
    event_path: string;
    event_category: string;
  };
}

export const DashboardActivitiesTab = ({ project }: DashboardActivitiesTabProps) => {
  const { data: projectActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_project_activity', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <ProjectActivitiesTab
      project={project}
      projectActivities={projectActivities}
      refetchActivities={refetchActivities}
    />
  );
};