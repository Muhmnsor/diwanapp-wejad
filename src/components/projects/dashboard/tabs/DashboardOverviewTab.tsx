import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
    id: string;
  };
}

export const DashboardOverviewTab = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project
}: DashboardOverviewTabProps) => {
  const { data: activitiesCount = 0 } = useQuery({
    queryKey: ['projectActivities', project.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('is_project_activity', true);
      
      if (error) {
        console.error('Error fetching activities count:', error);
        return 0;
      }
      
      return count || 0;
    }
  });

  return (
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      eventPath={project.event_path}
      eventCategory={project.event_category}
      activitiesCount={activitiesCount}
      isProject={true}
    />
  );
};