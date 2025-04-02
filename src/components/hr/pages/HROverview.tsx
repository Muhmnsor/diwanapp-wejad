
import { useHRStats, getTrendDirection } from "@/hooks/hr/useHRStats";
import { 
  Users, 
  CalendarClock, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  AlertCircle,
  UserPlus,
  Building,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/hr/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

// Default trend data for components that don't have it
const defaultTrendData = [0, 0, 0, 0, 0, 0, 0];

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
        <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isLoadingStats ? (
          <>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
          </>
        ) : (
          <>
            <StatCard
              title="الموظفين"
              value={stats?.totalEmployees || 0}
              description={`${stats?.newEmployees || 0} موظف جديد هذا الشهر`}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              trendData={stats?.trends?.employeeTrend || defaultTrendData}
              trendColor="#3b82f6"
            />
            
            <StatCard
              title="الحضور اليوم"
              value={stats?.presentToday || 0}
              description={`نسبة الحضور: ${stats?.attendanceRate || 0}%`}
              icon={<CalendarClock className="h-6 w-6 text-green-600" />}
              trendData={stats?.trends?.attendanceTrend || defaultTrendData}
              trendColor="#22c55e"
            />
            
            <StatCard
              title="الإجازات النشطة"
              value={stats?.activeLeaves || 0}
              description={`${stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم`}
              icon={<Calendar className="h-6 w-6 text-amber-600" />}
              trendData={stats?.trends?.leaveTrend || defaultTrendData}
              trendColor="#f59e0b"
            />
          </>
        )}
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingStats ? (
          <>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
            <Card className="p-4"><Skeleton className="h-24 w-full" /></Card>
          </>
        ) : (
          <>
            <StatCard
              title="العقود المنتهية قريباً"
              value={stats?.expiringContracts || 0}
              description="خلال الشهر القادم"
              icon={<Briefcase className="h-6 w-6 text-purple-600" />}
              trendData={defaultTrendData}
              trendColor="#9333ea"
            />
            
            <StatCard
              title="التدريبات الحالية"
              value={stats?.pendingTrainings || 0}
              description="برامج تدريبية قيد التنفيذ"
              icon={<GraduationCap className="h-6 w-6 text-cyan-600" />}
              trendData={stats?.trends?.trainingTrend || defaultTrendData}
              trendColor="#0891b2"
            />
            
            <StatCard
              title="المهام العاجلة"
              value={3}
              description="مهام تحتاج إلى متابعة فورية"
              icon={<AlertCircle className="h-6 w-6 text-red-600" />}
              trendData={defaultTrendData}
              trendColor="#dc2626"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HROverview;
