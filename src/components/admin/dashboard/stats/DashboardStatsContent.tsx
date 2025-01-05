import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { PathCategoryCard } from "./PathCategoryCard";
import { ActivitiesStatsCard } from "./ActivitiesStatsCard";
import { AttendanceAverageCard } from "./AttendanceAverageCard";
import { ActivityAttendanceCard } from "./ActivityAttendanceCard";
import { ActivityRatingCard } from "./ActivityRatingCard";

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
  project,
  activities
}: DashboardStatsContentProps) => {
  console.log("DashboardStatsContent props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <PathCategoryCard projectId={project.id} />

      <ActivitiesStatsCard
        activities={{
          total: activities?.total || 0,
          completed: activities?.completed || 0
        }}
      />
      
      <AttendanceAverageCard
        averageAttendance={activities?.averageAttendance || 0}
      />
      
      <ActivityAttendanceCard
        type="highest"
        title="أعلى نسبة حضور"
        activity={activities?.highestAttendance}
      />
      
      <ActivityAttendanceCard
        type="lowest"
        title="أقل نسبة حضور"
        activity={activities?.lowestAttendance}
      />
      
      <ActivityRatingCard
        type="highest"
        title="أعلى نشاط تقييماً"
        activity={activities?.highestRated}
      />
      
      <ActivityRatingCard
        type="lowest"
        title="أقل نشاط تقييماً"
        activity={activities?.lowestRated}
      />
    </div>
  );
};