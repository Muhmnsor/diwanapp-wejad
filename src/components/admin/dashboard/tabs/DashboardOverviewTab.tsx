import { DashboardOverview } from "@/components/admin/DashboardOverview";

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
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      project={{
        id: project.id,
        start_date: project.start_date,
        end_date: project.end_date,
        event_path: project.event_path || '',
        event_category: project.event_category || ''
      }}
      activities={activities}
    />
  );
};