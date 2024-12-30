import { DashboardStats } from "./DashboardStats";
import { RegistrantsTable } from "./dashboard/RegistrantsTable";
import { useRegistrantsStats } from "@/hooks/useRegistrantsStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
  projectId?: string;
  projectActivities?: {
    id: string;
    title: string;
    attendanceRate?: number;
    rating?: number;
    attendance_records?: {
      status: string;
      registration_id: string;
    }[];
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
  eventPath,
  eventCategory,
  projectId,
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
    eventPath,
    eventCategory,
    projectId,
    projectActivities,
    totalActivities,
    completedActivities,
    averageAttendanceRate
  });

  const { registrantsStats, isLoading } = useRegistrantsStats(projectId || '');

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventDate={eventDate}
        eventTime={eventTime}
        eventPath={eventPath}
        eventCategory={eventCategory}
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