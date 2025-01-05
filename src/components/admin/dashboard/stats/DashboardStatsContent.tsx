import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { PathCategoryCard } from "./PathCategoryCard";
import { ActivitiesStatsCard } from "./ActivitiesStatsCard";
import { AttendanceAverageCard } from "./AttendanceAverageCard";
import { ActivityAttendanceCard } from "./ActivityAttendanceCard";
import { ActivityRatingCard } from "./ActivityRatingCard";
import { EventStatsContent } from "./EventStatsContent";

interface DashboardStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
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
  };
  attendanceStats?: {
    highest: any;
    lowest: any;
  };
  ratingStats?: {
    highest: any;
    lowest: any;
  };
  isEvent?: boolean;
}

export const DashboardStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
  attendanceStats,
  ratingStats,
  isEvent = false
}: DashboardStatsContentProps) => {
  console.log("DashboardStatsContent props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities,
    attendanceStats,
    ratingStats,
    isEvent
  });

  if (isEvent) {
    return (
      <EventStatsContent
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        project={project}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <PathCategoryCard projectId={project.id} />

      {activities && (
        <ActivitiesStatsCard
          activities={{
            total: activities.total || 0,
            completed: activities.completed || 0
          }}
        />
      )}
      
      {activities?.averageAttendance !== undefined && (
        <AttendanceAverageCard
          averageAttendance={activities.averageAttendance}
        />
      )}
      
      {attendanceStats?.highest && (
        <ActivityAttendanceCard
          type="highest"
          title="أعلى نسبة حضور"
          activity={attendanceStats.highest}
        />
      )}
      
      {attendanceStats?.lowest && (
        <ActivityAttendanceCard
          type="lowest"
          title="أقل نسبة حضور"
          activity={attendanceStats.lowest}
        />
      )}
      
      {ratingStats?.highest && (
        <ActivityRatingCard
          type="highest"
          title="أعلى نشاط تقييماً"
          activity={ratingStats.highest}
        />
      )}
      
      {ratingStats?.lowest && (
        <ActivityRatingCard
          type="lowest"
          title="أقل نشاط تقييماً"
          activity={ratingStats.lowest}
        />
      )}
    </div>
  );
};