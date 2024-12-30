import { RegistrationStatsCard } from "./dashboard/stats/RegistrationStatsCard";
import { PathCategoryCard } from "./dashboard/stats/PathCategoryCard";
import { ActivitiesStatsCard } from "./dashboard/stats/ActivitiesStatsCard";

interface DashboardStatsProps {
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
  activities: {
    total: number;
    completed: number;
    averageAttendance: number;
  };
  isEvent?: boolean;
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
  isEvent = false
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities,
    isEvent
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <PathCategoryCard
        eventPath={project.event_path}
        eventCategory={project.event_category}
      />

      {!isEvent && (
        <ActivitiesStatsCard activities={activities} />
      )}
    </div>
  );
};