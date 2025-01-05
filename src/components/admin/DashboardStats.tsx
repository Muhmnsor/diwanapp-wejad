import { useAttendanceStatsQuery } from "./dashboard/stats/AttendanceStatsQuery";
import { useRatingStatsQuery } from "./dashboard/stats/RatingStatsQuery";
import { DashboardStatsContent } from "./dashboard/stats/DashboardStatsContent";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date?: string;
    end_date?: string;
    event_path: string;
    event_category: string;
    date?: string;
    averageRating?: number;
  };
  activities?: {
    total: number;
    completed: number;
    averageAttendance: number;
    highestAttendance?: {
      eventId: string;
      title: string;
      date: string;
      count: number;
      totalRegistrations: number;
      attendanceRate: number;
    } | null;
    lowestAttendance?: {
      eventId: string;
      title: string;
      date: string;
      count: number;
      totalRegistrations: number;
      attendanceRate: number;
    } | null;
    highestRated?: {
      eventId: string;
      title: string;
      date: string;
      averageRating: number;
      ratingsCount: number;
    } | null;
    lowestRated?: {
      eventId: string;
      title: string;
      date: string;
      averageRating: number;
      ratingsCount: number;
    } | null;
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

  // Transform project data based on whether it's an event or project
  const transformedProject = {
    id: project.id,
    event_path: project.event_path,
    event_category: project.event_category,
    date: isEvent ? project.date : undefined,
    averageRating: isEvent ? project.averageRating : undefined
  };

  return (
    <DashboardStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={transformedProject}
      activities={activities}
    />
  );
};