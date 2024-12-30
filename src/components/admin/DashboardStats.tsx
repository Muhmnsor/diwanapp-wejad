import { RegistrationStats } from "./dashboard/stats/RegistrationStats";
import { ActivityStats } from "./dashboard/stats/ActivityStats";
import { AttendanceStats } from "./dashboard/stats/AttendanceStats";
import { RatingStats } from "./dashboard/stats/RatingStats";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
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

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventPath,
  eventCategory,
  projectActivities = [],
  totalActivities = 0,
  completedActivities = 0,
  averageAttendanceRate = 0,
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventPath,
    eventCategory,
    projectActivities,
    totalActivities,
    completedActivities,
    averageAttendanceRate,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RegistrationStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />
      
      <ActivityStats
        totalActivities={totalActivities}
        completedActivities={completedActivities}
        averageAttendanceRate={averageAttendanceRate}
      />

      <AttendanceStats projectActivities={projectActivities} />
      
      <RatingStats projectActivities={projectActivities} />
    </div>
  );
};