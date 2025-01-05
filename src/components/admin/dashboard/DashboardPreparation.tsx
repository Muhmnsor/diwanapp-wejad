import { EventAttendanceTab } from "./preparation/EventAttendanceTab";

interface DashboardPreparationProps {
  eventId: string;
}

export const DashboardPreparation = ({ eventId }: DashboardPreparationProps) => {
  return <EventAttendanceTab eventId={eventId} />;
};