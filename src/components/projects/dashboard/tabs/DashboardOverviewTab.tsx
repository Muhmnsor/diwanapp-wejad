
import { DashboardOverview } from "@/components/admin/DashboardOverview";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  event: {
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
  event,
  activities
}: DashboardOverviewTabProps) => {
  console.log("DashboardOverviewTab props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    event,
    activities
  });

  return (
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      event={{
        id: event.id,
        start_date: event.start_date,
        end_date: event.end_date,
        event_path: event.event_path || '',
        event_category: event.event_category || ''
      }}
      activities={activities}
    />
  );
};
