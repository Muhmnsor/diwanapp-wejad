import { DashboardStats } from "./DashboardStats";
import { RegistrantsTable } from "./dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
  };
  activities?: {
    total: number;
    completed: number;
    averageAttendance: number;
  };
  isEvent?: boolean;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
  isEvent = false
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities,
    isEvent
  });

  const { registrantsStats, isLoading } = useRegistrantsStats(project?.id);

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        project={project}
        activities={activities}
        isEvent={isEvent}
      />

      {!isEvent && (
        <RegistrantsTable 
          registrantsStats={registrantsStats}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};