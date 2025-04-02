
import { Card } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { 
  Users, CalendarClock, FileBarChart, 
  Clock, AlertCircle, Calendar, 
  Briefcase, GraduationCap 
} from "lucide-react";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  // التأكد من وجود بيانات الاتجاهات قبل استخدامها
  const hasTrendData = stats?.trends && 
    stats.trends.attendance && 
    stats.trends.attendance.length > 1;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
        <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">الموظفين</p>
            <h3 className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.totalEmployees || 0}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "..." : stats?.newEmployees || 0} موظف جديد هذا الشهر
            </p>
            {hasTrendData && (
              <div className="mt-2 h-8">
                <Sparkline 
                  data={stats.trends.employees} 
                  height={24} 
                  color="#3b82f6"
                >
                  <SparklineSpot 
                    spotColors={{
                      endSpot: "#3b82f6",
                      spotColor: "rgba(59, 130, 246, 0.6)"
                    }}
                  />
                </Sparkline>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-green-100 rounded-full">
            <CalendarClock className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">الحضور اليوم</p>
            <h3 className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.presentToday || 0}
            </h3>
            <p className="text-xs text-muted-foreground">
              نسبة الحضور: {isLoadingStats ? "..." : `${stats?.attendanceRate || 0}%`}
            </p>
            {hasTrendData && (
              <div className="mt-2 h-8">
                <Sparkline 
                  data={stats.trends.attendance} 
                  height={24} 
                  color="#22c55e"
                >
                  <SparklineSpot 
                    spotColors={{
                      endSpot: "#22c55e",
                      spotColor: "rgba(34, 197, 94, 0.6)"
                    }}
                  />
                </Sparkline>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-amber-100 rounded-full">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">الإجازات النشطة</p>
            <h3 className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.activeLeaves || 0}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? "..." : stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم
            </p>
            {hasTrendData && (
              <div className="mt-2 h-8">
                <Sparkline 
                  data={stats.trends.leaves} 
                  height={24} 
                  color="#f59e0b"
                >
                  <SparklineSpot 
                    spotColors={{
                      endSpot: "#f59e0b",
                      spotColor: "rgba(245, 158, 11, 0.6)"
                    }}
                  />
                </Sparkline>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-purple-100 rounded-full">
            <Briefcase className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">العقود المنتهية قريباً</p>
            <h3 className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.expiringContracts || 0}
            </h3>
            <p className="text-xs text-muted-foreground">
              خلال الشهر القادم
            </p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-cyan-100 rounded-full">
            <GraduationCap className="h-6 w-6 text-cyan-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">التدريبات الحالية</p>
            <h3 className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats?.pendingTrainings || 0}
            </h3>
            <p className="text-xs text-muted-foreground">
              برامج تدريبية قيد التنفيذ
            </p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">المهام العاجلة</p>
            <h3 className="text-2xl font-bold">
              3
            </h3>
            <p className="text-xs text-muted-foreground">
              مهام تحتاج إلى متابعة فورية
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;
