import { useAttendanceStatsQuery } from "./dashboard/stats/AttendanceStatsQuery";
import { useRatingStatsQuery } from "./dashboard/stats/RatingStatsQuery";
import { DashboardStatsContent } from "./dashboard/stats/DashboardStatsContent";

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

  const { data: attendanceStats } = useAttendanceStatsQuery({
    projectId: project.id,
    isEvent
  });

  const { data: ratingStats } = useRatingStatsQuery({
    projectId: project.id,
    isEvent
  });

  return (
    <DashboardStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={project}
      activities={activities}
      attendanceStats={attendanceStats}
      ratingStats={ratingStats}
      isEvent={isEvent}
    />
  );
};