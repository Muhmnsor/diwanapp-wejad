import { useAttendanceStatsQuery } from "./dashboard/stats/AttendanceStatsQuery";
import { useRatingStatsQuery } from "./dashboard/stats/RatingStatsQuery";
import { DashboardStatsContent } from "./dashboard/stats/DashboardStatsContent";
import { EventStatsContent } from "./dashboard/stats/EventStatsContent";

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
    start_date: isEvent ? project.date || '' : project.start_date || '',
    end_date: isEvent ? project.date || '' : project.end_date || '',
    event_path: project.event_path,
    event_category: project.event_category,
    averageRating: project.averageRating
  };

  return isEvent ? (
    <EventStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={transformedProject}
    />
  ) : (
    <DashboardStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={transformedProject}
      activities={activities}
    />
  );
};