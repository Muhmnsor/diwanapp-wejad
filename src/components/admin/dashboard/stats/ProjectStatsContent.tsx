import { Card } from "@/components/ui/card";
import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { ActivitiesStatsCard } from "./ActivitiesStatsCard";
import { AttendanceAverageCard } from "./AttendanceAverageCard";
import { PathCategoryCard } from "./PathCategoryCard";
import { ActivityAttendanceCard } from "./ActivityAttendanceCard";
import { ActivityRatingCard } from "./ActivityRatingCard";

interface ProjectStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    event_path?: string;
    event_category?: string;
  };
  activities: {
    total: number;
    completed: number;
    averageAttendance: number;
    highestAttendance: any;
    lowestAttendance: any;
    highestRated: any;
    lowestRated: any;
  };
}

export const ProjectStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
}: ProjectStatsContentProps) => {
  console.log("ProjectStatsContent props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities
  });

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RegistrationStatsCard
          registrationCount={registrationCount}
          remainingSeats={remainingSeats}
          occupancyRate={occupancyRate}
        />
        <ActivitiesStatsCard activities={activities} />
        <AttendanceAverageCard averageAttendance={activities.averageAttendance} />
        <PathCategoryCard projectId={project.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActivityAttendanceCard
          type="highest"
          title="أعلى نسبة حضور"
          activity={activities.highestAttendance}
        />
        <ActivityAttendanceCard
          type="lowest"
          title="أقل نسبة حضور"
          activity={activities.lowestAttendance}
        />
        <ActivityRatingCard
          type="highest"
          title="أعلى تقييم"
          activity={activities.highestRated}
        />
        <ActivityRatingCard
          type="lowest"
          title="أقل تقييم"
          activity={activities.lowestRated}
        />
      </div>
    </div>
  );
};