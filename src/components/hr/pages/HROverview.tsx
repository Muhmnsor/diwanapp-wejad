import React from "react";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { Users, CalendarClock, GraduationCap, BriefcaseIcon, AlertCircle } from "lucide-react";

const HROverview = () => {
  const { data: stats, isLoading, error } = useHRStats();

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل البيانات...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">حدث خطأ أثناء تحميل البيانات</div>;
  }

  const ensureValidTrend = (trend?: number[]): number[] => {
    return Array.isArray(trend) && trend.length > 0 ? trend : [0, 0];
  };

  const employeeTrend = ensureValidTrend(stats?.employeeTrend);
  const attendanceTrend = ensureValidTrend(stats?.attendanceTrend);
  const leavesTrend = ensureValidTrend(stats?.leavesTrend);
  const contractsTrend = ensureValidTrend(stats?.contractsTrend);
  const trainingsTrend = ensureValidTrend(stats?.trainingsTrend);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6">نظرة عامة</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employee Stats Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الموظفون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.newEmployees || 0} موظف جديد هذا الشهر
            </p>
            <div className="h-[40px] mt-3">
              <Sparkline data={employeeTrend} height={40} color="#4ade80">
                <SparklineSpot />
              </Sparkline>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الحضور</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              نسبة الحضور {stats?.attendanceRate || 0}%
            </p>
            <div className="h-[40px] mt-3">
              <Sparkline data={attendanceTrend} height={40} color="#3b82f6">
                <SparklineSpot spotColors={{ 
                  endSpot: "#3b82f6", 
                  spotColor: "rgba(59, 130, 246, 0.6)" 
                }} />
              </Sparkline>
            </div>
          </CardContent>
        </Card>

        {/* Leaves Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الإجازات</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.upcomingLeaves || 0} إجازة قادمة هذا الأسبوع
            </p>
            <div className="h-[40px] mt-3">
              <Sparkline data={leavesTrend} height={40} color="#f97316">
                <SparklineSpot spotColors={{ 
                  endSpot: "#f97316", 
                  spotColor: "rgba(249, 115, 22, 0.6)" 
                }} />
              </Sparkline>
            </div>
          </CardContent>
        </Card>

        {/* Training Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">التدريب</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTrainings || 0}</div>
            <p className="text-xs text-muted-foreground">
              تدريب قيد الانتظار
            </p>
            <div className="h-[40px] mt-3">
              <Sparkline data={trainingsTrend} height={40} color="#a855f7">
                <SparklineSpot spotColors={{ 
                  endSpot: "#a855f7", 
                  spotColor: "rgba(168, 85, 247, 0.6)" 
                }} />
              </Sparkline>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">العقود المنتهية قريباً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span>{stats?.expiringContracts || 0} عقد ستنتهي خلال الشهر القادم</span>
            </div>
            <div className="h-[40px] mt-3">
              <Sparkline data={contractsTrend} height={40} color="#eab308">
                <SparklineSpot spotColors={{ 
                  endSpot: "#eab308", 
                  spotColor: "rgba(234, 179, 8, 0.6)" 
                }} />
              </Sparkline>
            </div>
          </CardContent>
        </Card>

        {/* Other Analytics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">التوزيع الوظيفي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              سيتم إضافة رسم بياني للتوزيع الوظيفي هنا
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HROverview;
