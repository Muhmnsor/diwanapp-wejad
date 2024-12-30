import { DashboardStats } from "./DashboardStats";
import { RegistrantsTable } from "./dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventPath?: string;
  eventCategory?: string;
  projectId?: string;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventPath,
  eventCategory,
  projectId
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventPath,
    eventCategory,
    projectId
  });

  const { registrantsStats, isLoading } = useRegistrantsStats(projectId || '');

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />

      <RegistrantsTable 
        registrantsStats={registrantsStats}
        isLoading={isLoading}
      />
    </div>
  );
};