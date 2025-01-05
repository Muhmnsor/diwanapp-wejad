import { ActivitiesStatsCard } from "../ActivitiesStatsCard";
import { AttendanceAverageCard } from "../AttendanceAverageCard";

interface ActivitiesStatsSectionProps {
  activities: {
    total: number;
    completed: number;
  };
  averageAttendance: number;
}

export const ActivitiesStatsSection = ({
  activities,
  averageAttendance,
}: ActivitiesStatsSectionProps) => {
  return (
    <>
      <ActivitiesStatsCard activities={activities} />
      <AttendanceAverageCard averageAttendance={averageAttendance} />
    </>
  );
};