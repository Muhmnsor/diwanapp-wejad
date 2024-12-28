import { DashboardStats } from "./DashboardStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventPath,
  eventCategory
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventDate,
    eventTime,
    eventPath,
    eventCategory
  });

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
    </div>
  );
};