
import { ProjectRatingCard } from "./ProjectRatingCard";
import { RegistrationStatsSection } from "./cards/RegistrationStatsSection";
import { ActivitiesStatsSection } from "./cards/ActivitiesStatsSection";
import { AttendanceStatsSection } from "./cards/AttendanceStatsSection";
import { RatingStatsSection } from "./cards/RatingStatsSection";

interface DashboardStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  event: {
    id: string;
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
}

export const DashboardStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  event,
  activities
}: DashboardStatsContentProps) => {
  console.log("DashboardStatsContent props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    event,
    activities
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RegistrationStatsSection
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
        />
        
        <ProjectRatingCard projectId={event.id} />

        {activities && (
          <ActivitiesStatsSection
            activities={{
              total: activities.total,
              completed: activities.completed
            }}
            averageAttendance={activities.averageAttendance}
          />
        )}
      </div>
      
      {activities && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AttendanceStatsSection
            highestAttendance={activities.highestAttendance}
            lowestAttendance={activities.lowestAttendance}
          />
          
          <RatingStatsSection
            highestRated={activities.highestRated}
            lowestRated={activities.lowestRated}
          />
        </div>
      )}
    </div>
  );
};
