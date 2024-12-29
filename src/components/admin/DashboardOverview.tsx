import { DashboardStats } from "./DashboardStats";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate?: string;
  eventTime?: string;
  eventPath?: string;
  eventCategory?: string;
  activitiesCount?: number;
  isProject?: boolean;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventPath,
  eventCategory,
  activitiesCount = 0,
  isProject = false
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventDate,
    eventTime,
    eventPath,
    eventCategory,
    activitiesCount,
    isProject
  });

  return (
    <DashboardStats
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
      eventDate={isProject ? undefined : eventDate}
      eventTime={isProject ? undefined : eventTime}
      eventPath={eventPath}
      eventCategory={eventCategory}
      activitiesCount={isProject ? activitiesCount : undefined}
    />
  );
};