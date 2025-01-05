import { Users, Calendar, Star, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "./StatCard";
import { DashboardData } from "@/types/dashboard";

interface EventStatsSectionProps {
  data: DashboardData;
}

export const EventStatsSection = ({ data }: EventStatsSectionProps) => {
  return (
    <>
      <StatCard
        title="إجمالي الأحداث"
        value={data.totalEvents}
        subtitle={`${data.projectsCount} مشروع | ${data.eventsCount} فعالية`}
        icon={Calendar}
      />
      
      <StatCard
        title="إجمالي المسجلين"
        value={data.totalRegistrations}
        icon={Users}
      />

      <StatCard
        title="إجمالي الإيرادات"
        value={`${data.totalRevenue} ريال`}
        icon={Users}
      />

      <StatCard
        title="الحدث الأكثر حضوراً"
        value={data.mostAttendedEvent?.title || 'لا يوجد'}
        subtitle={`${data.mostAttendedEvent?.attendanceCount || 0} حاضر (${(data.mostAttendedEvent?.percentage || 0).toFixed(1)}%)`}
        icon={TrendingUp}
        iconColor="text-green-500"
      />

      <StatCard
        title="الحدث الأقل حضوراً"
        value={data.leastAttendedEvent?.title || 'لا يوجد'}
        subtitle={`${data.leastAttendedEvent?.attendanceCount || 0} حاضر (${(data.leastAttendedEvent?.percentage || 0).toFixed(1)}%)`}
        icon={TrendingDown}
        iconColor="text-red-500"
      />

      <StatCard
        title="متوسط الحضور"
        value={`${data.averageAttendance?.toFixed(1) || 0}%`}
        icon={Users}
      />

      <StatCard
        title="الحدث الأعلى تقييماً"
        value={data.highestRatedEvent?.title || 'لا يوجد'}
        subtitle={`${(data.highestRatedEvent?.rating || 0).toFixed(1)} من 5`}
        icon={TrendingUp}
        iconColor="text-green-500"
      />

      <StatCard
        title="الحدث الأقل تقييماً"
        value={data.lowestRatedEvent?.title || 'لا يوجد'}
        subtitle={`${(data.lowestRatedEvent?.rating || 0).toFixed(1)} من 5`}
        icon={TrendingDown}
        iconColor="text-red-500"
      />

      <StatCard
        title="متوسط التقييم"
        value={`${data.averageRating?.toFixed(1) || 0} من 5`}
        icon={Star}
      />
    </>
  );
};