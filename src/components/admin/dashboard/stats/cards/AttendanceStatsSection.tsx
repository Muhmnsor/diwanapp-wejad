import { ActivityAttendanceCard } from "../ActivityAttendanceCard";

interface AttendanceStatsSectionProps {
  highestAttendance?: {
    eventId: string;
    title: string;
    date: string;
    count: number;
    totalRegistrations: number;
    attendanceRate: number;
  } | null;
  lowestAttendance?: {
    eventId: string;
    title: string;
    date: string;
    count: number;
    totalRegistrations: number;
    attendanceRate: number;
  } | null;
}

export const AttendanceStatsSection = ({
  highestAttendance,
  lowestAttendance,
}: AttendanceStatsSectionProps) => {
  return (
    <>
      <ActivityAttendanceCard
        type="highest"
        title="أعلى نسبة حضور"
        activity={highestAttendance}
      />
      <ActivityAttendanceCard
        type="lowest"
        title="أقل نسبة حضور"
        activity={lowestAttendance}
      />
    </>
  );
};