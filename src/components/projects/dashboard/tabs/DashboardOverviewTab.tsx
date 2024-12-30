import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { ProjectActivityStats } from "../stats/ProjectActivityStats";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
  };
}

export const DashboardOverviewTab = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
}: DashboardOverviewTabProps) => {
  return (
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      eventDate={project.start_date}
      eventTime={project.end_date}
      eventPath={project.event_path}
      eventCategory={project.event_category}
      projectId={project.id}
      ActivityStatsComponent={<ProjectActivityStats projectId={project.id} />}
    />
  );
};