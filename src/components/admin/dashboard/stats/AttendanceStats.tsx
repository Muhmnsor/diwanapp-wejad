import { TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "./StatCard";

interface AttendanceStatsProps {
  projectActivities?: {
    id: string;
    title: string;
    attendanceRate?: number;
    rating?: number;
  }[];
}

export const AttendanceStats = ({ projectActivities = [] }: AttendanceStatsProps) => {
  const sortedByAttendance = [...(projectActivities || [])].sort((a, b) => 
    (b.attendanceRate || 0) - (a.attendanceRate || 0)
  );
  const highestAttendance = sortedByAttendance[0];
  const lowestAttendance = sortedByAttendance[sortedByAttendance.length - 1];

  return (
    <>
      <StatCard
        title="أعلى نسبة حضور"
        value={highestAttendance?.title || '-'}
        subtitle={`${highestAttendance?.attendanceRate?.toFixed(1) || 0}%`}
        icon={TrendingUp}
      />
      <StatCard
        title="أقل نسبة حضور"
        value={lowestAttendance?.title || '-'}
        subtitle={`${lowestAttendance?.attendanceRate?.toFixed(1) || 0}%`}
        icon={TrendingDown}
      />
    </>
  );
};