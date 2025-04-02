
import { useHRStats } from "@/hooks/hr/useHRStats";
import { HRStatsCard } from "@/components/hr/stats/HRStatsCard";
import { 
  Users, CalendarClock, Clock, AlertCircle, 
  Calendar, Briefcase, GraduationCap, TrendingUp, 
  CircleDollarSign, Timer, Hourglass
} from "lucide-react";

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  // Sample historical data for sparklines
  // In a real scenario, these would come from the API
  const attendanceHistory = stats?.attendanceHistory || [65, 68, 70, 72, 75, 76];
  const employeeCountHistory = stats?.employeeCountHistory || [120, 122, 125, 128, 130, 132];
  const leaveHistory = stats?.leaveHistory || [8, 12, 10, 15, 8, 9];
  const turnoverHistory = stats?.turnoverHistory || [3.2, 3.0, 2.8, 2.5, 2.2, 2.0];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
        <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
      </div>

      {/* Employee Stats Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">إحصائيات الموظفين</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HRStatsCard
            title="إجمالي الموظفين"
            value={isLoadingStats ? "..." : stats?.totalEmployees || 0}
            icon={<Users />}
            iconBgColor="bg-blue-100" 
            iconTextColor="text-blue-600"
            trend={stats?.employeeGrowthRate}
            trendLabel={`${isLoadingStats ? "..." : stats?.newEmployees || 0} موظف جديد هذا الشهر`}
            sparklineData={employeeCountHistory}
            sparklineColor="#4287f5"
          />
          
          <HRStatsCard
            title="معدل دوران الموظفين"
            value={isLoadingStats ? "..." : `${stats?.turnoverRate || 0}%`}
            icon={<TrendingUp />}
            iconBgColor="bg-amber-100" 
            iconTextColor="text-amber-600"
            trend={stats?.turnoverChange}
            trendLabel="مقارنة بالشهر السابق"
            sparklineData={turnoverHistory}
            sparklineColor={stats?.turnoverChange && stats.turnoverChange <= 0 ? "#4ade80" : "#ef4444"}
          />
          
          <HRStatsCard
            title="متوسط فترة الخدمة"
            value={isLoadingStats ? "..." : `${stats?.averageTenure || 0} سنة`}
            icon={<Hourglass />}
            iconBgColor="bg-purple-100" 
            iconTextColor="text-purple-600"
            trendLabel="متوسط سنوات الخدمة للموظفين"
          />
        </div>
      </div>

      {/* Attendance Stats Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">إحصائيات الحضور والإجازات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HRStatsCard
            title="الحضور اليوم"
            value={isLoadingStats ? "..." : stats?.presentToday || 0}
            icon={<CalendarClock />}
            iconBgColor="bg-green-100" 
            iconTextColor="text-green-600"
            trend={stats?.attendanceRateChange}
            trendLabel={`نسبة الحضور: ${isLoadingStats ? "..." : `${stats?.attendanceRate || 0}%`}`}
            sparklineData={attendanceHistory}
          />
          
          <HRStatsCard
            title="الإجازات النشطة"
            value={isLoadingStats ? "..." : stats?.activeLeaves || 0}
            icon={<Calendar />}
            iconBgColor="bg-amber-100" 
            iconTextColor="text-amber-600"
            trendLabel={`${isLoadingStats ? "..." : stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم`}
            sparklineData={leaveHistory}
            sparklineColor="#f59e0b"
          />
          
          <HRStatsCard
            title="معدل استخدام الإجازات"
            value={isLoadingStats ? "..." : `${stats?.leaveUtilizationRate || 0}%`}
            icon={<Timer />}
            iconBgColor="bg-cyan-100" 
            iconTextColor="text-cyan-600"
            trend={stats?.leaveUtilizationChange}
            trendLabel="مقارنة بالربع السابق"
            sparklineData={[60, 65, 62, 68, 70, 72]}
            sparklineColor="#0ea5e9"
          />
        </div>
      </div>

      {/* Contracts and Training Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">العقود والتدريب</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HRStatsCard
            title="العقود المنتهية قريباً"
            value={isLoadingStats ? "..." : stats?.expiringContracts || 0}
            icon={<Briefcase />}
            iconBgColor="bg-purple-100" 
            iconTextColor="text-purple-600"
            trendLabel="خلال الشهر القادم"
          />
          
          <HRStatsCard
            title="التدريبات الحالية"
            value={isLoadingStats ? "..." : stats?.pendingTrainings || 0}
            icon={<GraduationCap />}
            iconBgColor="bg-cyan-100" 
            iconTextColor="text-cyan-600"
            trendLabel="برامج تدريبية قيد التنفيذ"
          />
          
          <HRStatsCard
            title="ميزانية التدريب المستخدمة"
            value={isLoadingStats ? "..." : `${stats?.trainingBudgetUsed || 0}%`}
            icon={<CircleDollarSign />}
            iconBgColor="bg-green-100" 
            iconTextColor="text-green-600"
            trend={stats?.trainingBudgetChange}
            trendLabel="من الميزانية السنوية"
          />
        </div>
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">التنبيهات والمهام</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HRStatsCard
            title="المهام العاجلة"
            value="3"
            icon={<AlertCircle />}
            iconBgColor="bg-red-100" 
            iconTextColor="text-red-600"
            trendLabel="مهام تحتاج إلى متابعة فورية"
          />
          
          <HRStatsCard
            title="طلبات الإجازة المعلقة"
            value={isLoadingStats ? "..." : stats?.pendingLeaveRequests || 0}
            icon={<Clock />}
            iconBgColor="bg-orange-100" 
            iconTextColor="text-orange-600"
            trendLabel="تحتاج إلى مراجعة وموافقة"
          />
        </div>
      </div>
    </div>
  );
};

export default HROverview;
