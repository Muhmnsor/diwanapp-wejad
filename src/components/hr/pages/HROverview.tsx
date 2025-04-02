
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, CalendarClock, FileBarChart, Clock, AlertCircle, Calendar, Briefcase, GraduationCap } from "lucide-react";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";

const HROverview = () => {
  const { data: stats, isLoading, error } = useHRStats();

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
          <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
        </div>
        
        <EmptyState
          title="حدث خطأ في تحميل البيانات"
          description="يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقاً"
          icon={<AlertCircle className="h-10 w-10 text-red-500" />}
        />
      </div>
    );
  }

  // Loading state - simple skeleton version of cards
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
          <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
        </div>
        
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 flex items-center">
              <div className="p-2 rounded-full"><Skeleton className="h-6 w-6 rounded-full" /></div>
              <div className="flex-1 rtl:text-right pl-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 flex items-center">
              <div className="p-2 rounded-full"><Skeleton className="h-6 w-6 rounded-full" /></div>
              <div className="flex-1 rtl:text-right pl-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            <div className="flex items-end">
              <h3 className="text-2xl font-bold">{stats?.totalEmployees || 0}</h3>
              {stats?.employeeTrend && stats.employeeTrend.length > 0 && (
                <div className="mb-1 mx-3 w-20 h-8">
                  <Sparkline data={stats.employeeTrend}>
                    <SparklineSpot />
                  </Sparkline>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.newEmployees || 0} موظف جديد هذا الشهر
            </p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-green-100 rounded-full">
            <CalendarClock className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">الحضور اليوم</p>
            <div className="flex items-end">
              <h3 className="text-2xl font-bold">{stats?.presentToday || 0}</h3>
              {stats?.attendanceTrend && stats.attendanceTrend.length > 0 && (
                <div className="mb-1 mx-3 w-20 h-8">
                  <Sparkline data={stats.attendanceTrend} color="#16a34a">
                    <SparklineSpot 
                      spotColors={{
                        endSpot: "#16a34a",
                        spotColor: "rgba(22, 163, 74, 0.6)"
                      }}
                    />
                  </Sparkline>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              نسبة الحضور: {`${stats?.attendanceRate || 0}%`}
            </p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center space-x-4 space-x-reverse">
          <div className="p-2 bg-amber-100 rounded-full">
            <Calendar className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1 rtl:text-right">
            <p className="text-sm text-muted-foreground">الإجازات النشطة</p>
            <div className="flex items-end">
              <h3 className="text-2xl font-bold">{stats?.activeLeaves || 0}</h3>
              {stats?.leavesTrend && stats.leavesTrend.length > 0 && (
                <div className="mb-1 mx-3 w-20 h-8">
                  <Sparkline data={stats.leavesTrend} color="#d97706">
                    <SparklineSpot 
                      spotColors={{
                        endSpot: "#d97706",
                        spotColor: "rgba(217, 119, 6, 0.6)"
                      }}
                    />
                  </Sparkline>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم
            </p>
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
              {stats?.expiringContracts || 0}
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
              {stats?.pendingTrainings || 0}
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
