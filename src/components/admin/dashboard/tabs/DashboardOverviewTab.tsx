import { DashboardOverview } from "@/components/admin/DashboardOverview";

interface DashboardOverviewTabProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  event?: {
    id: string;
    start_date?: string;
    end_date?: string;
    event_path?: string;
    event_category?: string;
  };
  project?: {
    id: string;
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
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
  project,
  activities
}: DashboardOverviewTabProps) => {
  console.log("DashboardOverviewTab props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    event,
    project,
    activities
  });

  const eventData = {
    id: project?.id || event?.id || '',
    start_date: project?.start_date || event?.start_date || '',
    end_date: project?.end_date || event?.end_date || '',
    event_path: project?.event_path || event?.event_path || '',
    event_category: project?.event_category || event?.event_category || ''
  };

  return (
    <DashboardOverview
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      event={eventData}
      activities={activities}
    />
  );
};