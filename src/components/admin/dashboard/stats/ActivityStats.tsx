import { Activity } from "lucide-react";
import { StatCard } from "./StatCard";

interface ActivityStatsProps {
  totalActivities: number;
  completedActivities: number;
  averageAttendanceRate: number;
}

export const ActivityStats = ({
  totalActivities,
  completedActivities,
  averageAttendanceRate
}: ActivityStatsProps) => {
  return (
    <StatCard
      title="الأنشطة المتبقية"
      value={`${totalActivities - completedActivities} من ${totalActivities}`}
      subtitle={`متوسط نسبة الحضور ${averageAttendanceRate?.toFixed(1)}%`}
      icon={Activity}
    />
  );
};