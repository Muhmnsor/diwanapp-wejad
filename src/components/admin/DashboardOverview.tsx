import { DashboardStats } from "./DashboardStats";
import { RegistrantsTable } from "./dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewProps {
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

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project
  });

  const { registrantsStats, isLoading } = useRegistrantsStats(project.id);

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        project={project}
      />

      <RegistrantsTable 
        registrantsStats={registrantsStats}
        isLoading={isLoading}
      />
    </div>
  );
};