import { DashboardStats } from "./DashboardStats";
import { RegistrantsTable } from "./dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  project?: {
    event_path?: string;
    event_category?: string;
    id?: string;
  };
  projectActivities?: {
    id: string;
    title: string;
    attendanceRate?: number;
    rating?: number;
  }[];
  totalActivities?: number;
  completedActivities?: number;
  averageAttendanceRate?: number;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  project,
  projectActivities = [],
  totalActivities = 0,
  completedActivities = 0,
  averageAttendanceRate = 0
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventDate,
    eventTime,
    project,
    projectActivities,
    totalActivities,
    completedActivities,
    averageAttendanceRate
  });

  const { registrantsStats, isLoading } = useRegistrantsStats(project?.id || '');

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventDate={eventDate}
        eventTime={eventTime}
        eventPath={project?.event_path}
        eventCategory={project?.event_category}
        projectActivities={projectActivities}
        totalActivities={totalActivities}
        completedActivities={completedActivities}
        averageAttendanceRate={averageAttendanceRate}
      />

      <RegistrantsTable 
        registrantsStats={registrantsStats}
        isLoading={isLoading}
      />
    </div>
  );
};