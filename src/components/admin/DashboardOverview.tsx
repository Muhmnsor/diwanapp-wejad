import { Card } from "@/components/ui/card";
import { DashboardStats } from "./DashboardStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime
}: DashboardOverviewProps) => {
  return (
    <DashboardStats
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      eventDate={eventDate}
      eventTime={eventTime}
    />
  );
};