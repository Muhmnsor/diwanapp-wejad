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
  console.log('ActivityStats props:', {
    totalActivities,
    completedActivities,
    averageAttendanceRate
  });

  const remainingActivities = totalActivities - completedActivities;
  const formattedAttendanceRate = averageAttendanceRate?.toFixed(1) || '0';

  return (
    <StatCard
      title="الأنشطة المتبقية"
      value={`${remainingActivities} من ${totalActivities}`}
      subtitle={`متوسط نسبة الحضور ${formattedAttendanceRate}%`}
      icon={Activity}
    />
  );
};