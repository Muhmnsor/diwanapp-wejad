import { ProjectStatsContent } from "../stats/ProjectStatsContent";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
    id: string;
  };
  activities?: {
    total: number;
    completed: number;
    averageAttendance: number;
    highestAttendance: any;
    lowestAttendance: any;
    highestRated: any;
    lowestRated: any;
  };
}

export const DashboardOverviewTab = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities
}: DashboardOverviewTabProps) => {
  console.log("DashboardOverviewTab props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities
  });

  return (
    <ProjectStatsContent
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={project}
      activities={activities || {
        total: 0,
        completed: 0,
        averageAttendance: 0,
        highestAttendance: null,
        lowestAttendance: null,
        highestRated: null,
        lowestRated: null
      }}
    />
  );
};