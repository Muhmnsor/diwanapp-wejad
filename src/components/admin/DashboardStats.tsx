import { useAttendanceStatsQuery } from "./dashboard/stats/AttendanceStatsQuery";
import { useRatingStatsQuery } from "./dashboard/stats/RatingStatsQuery";
import { DashboardStatsContent } from "./dashboard/stats/DashboardStatsContent";
import { EventStatsContent } from "./dashboard/stats/EventStatsContent";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  event: {
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
  event,
  activities,
  isEvent = false
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    event,
    activities,
    isEvent
  });

  const formattedEvent = {
    id: event.id,
    start_date: event.start_date || event.date || '',
    end_date: event.end_date || event.date || '',
    event_path: event.event_path,
    event_category: event.event_category,
    averageRating: event.averageRating
  };

  return isEvent ? (
    <EventStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      event={formattedEvent}
    />
  ) : (
    <DashboardStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      event={formattedEvent}
      activities={activities}
    />
  );
};