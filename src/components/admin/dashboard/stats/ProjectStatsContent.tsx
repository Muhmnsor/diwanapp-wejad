import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { ActivitiesStatsCard } from "./ActivitiesStatsCard";
import { ActivityAttendanceCard } from "./ActivityAttendanceCard";
import { ActivityRatingCard } from "./ActivityRatingCard";
import { PathCategoryCard } from "./PathCategoryCard";

interface ProjectStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    event_path: string;
    event_category: string;
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

export const ProjectStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities
}: ProjectStatsContentProps) => {
  console.log("ProjectStatsContent props:", {
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
      
      {activities && (
        <>
          <ActivitiesStatsCard
            total={activities.total}
            completed={activities.completed}
            averageAttendance={activities.averageAttendance}
          />
          
          <ActivityAttendanceCard
            highestAttendance={activities.highestAttendance}
            lowestAttendance={activities.lowestAttendance}
          />
          
          <ActivityRatingCard
            highestRated={activities.highestRated}
            lowestRated={activities.lowestRated}
          />
        </>
      )}
    </div>
  );
};