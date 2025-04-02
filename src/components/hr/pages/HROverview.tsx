
import { Card } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Users, CalendarClock, FileBarChart, Clock, AlertCircle, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

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
            {!isLoadingStats && stats?.employeeTrend && (
              <Sparkline 
                data={stats.employeeTrend} 
                height={20} 
                className="mt-2"
                color="#4361ee"
              >
                <SparklineSpot 
                  spotColors={{ 
                    endSpot: "#4361ee", 
                    spotColor: "rgba(67, 97, 238, 0.6)" 
                  }} 
                />
              </Sparkline>
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
            {!isLoadingStats && stats?.attendanceTrend && (
              <Sparkline 
                data={stats.attendanceTrend} 
                height={20} 
                className="mt-2"
                color="#10b981"
              >
                <SparklineSpot 
                  spotColors={{ 
                    endSpot: "#10b981", 
                    spotColor: "rgba(16, 185, 129, 0.6)" 
                  }} 
                />
              </Sparkline>
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
            {!isLoadingStats && stats?.leavesTrend && (
              <Sparkline 
                data={stats.leavesTrend} 
                height={20} 
                className="mt-2"
                color="#f59e0b"
              >
                <SparklineSpot 
                  spotColors={{ 
                    endSpot: "#f59e0b", 
                    spotColor: "rgba(245, 158, 11, 0.6)" 
                  }} 
                />
              </Sparkline>
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
            {!isLoadingStats && stats?.contractsTrend && (
              <Sparkline 
                data={stats.contractsTrend} 
                height={20} 
                className="mt-2"
                color="#8b5cf6"
              >
                <SparklineSpot 
                  spotColors={{ 
                    endSpot: "#8b5cf6", 
                    spotColor: "rgba(139, 92, 246, 0.6)" 
                  }} 
                />
              </Sparkline>
            )}
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
            {!isLoadingStats && stats?.trainingsTrend && (
              <Sparkline 
                data={stats.trainingsTrend} 
                height={20} 
                className="mt-2"
                color="#06b6d4"
              >
                <SparklineSpot 
                  spotColors={{ 
                    endSpot: "#06b6d4", 
                    spotColor: "rgba(6, 182, 212, 0.6)" 
                  }} 
                />
              </Sparkline>
            )}
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
            {/* Simple static trend data */}
            <Sparkline 
              data={[3, 5, 2, 6, 4, 3, 3]} 
              height={20} 
              className="mt-2"
              color="#ef4444"
            >
              <SparklineSpot 
                spotColors={{ 
                  endSpot: "#ef4444", 
                  spotColor: "rgba(239, 68, 68, 0.6)" 
                }} 
              />
            </Sparkline>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;
