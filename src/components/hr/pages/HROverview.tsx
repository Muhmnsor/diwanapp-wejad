
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { ArrowUpRight, ArrowDownRight, Users, UserPlus, Calendar, ClipboardList, FileWarning, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const HROverview = () => {
  const { data: stats, isLoading, error } = useHRStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-12 w-16" />
                    <Skeleton className="h-6 w-full mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <EmptyState
        title="لا يمكن تحميل البيانات"
        description="حدث خطأ أثناء تحميل إحصائيات الموارد البشرية. يرجى المحاولة مرة أخرى."
        icon={<FileWarning className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">لوحة متابعة الموارد البشرية</CardTitle>
          <CardDescription>نظرة عامة على بيانات ومؤشرات الموارد البشرية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employees Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">إجمالي الموظفين</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <div className="h-10 mt-2">
                  {Array.isArray(stats.employeeTrend) && stats.employeeTrend.length > 0 && (
                    <Sparkline data={stats.employeeTrend} height={20} color="#4ade80">
                      <SparklineSpot />
                    </Sparkline>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* New Employees */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">موظفين جدد</span>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.newEmployees}</div>
                <div className="flex items-center mt-2 text-green-500 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>هذا الشهر</span>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Rate */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">نسبة الحضور</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                <div className="h-10 mt-2">
                  {Array.isArray(stats.attendanceTrend) && stats.attendanceTrend.length > 0 && (
                    <Sparkline data={stats.attendanceTrend} height={20} color="#4ade80">
                      <SparklineSpot />
                    </Sparkline>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Present Today */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">الحضور اليوم</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.presentToday}</div>
                <div className="flex items-center mt-2 text-green-500 text-sm">
                  <span>من {stats.totalEmployees} موظف</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Leaves */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">إجازات نشطة</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.activeLeaves}</div>
                <div className="h-10 mt-2">
                  {Array.isArray(stats.leavesTrend) && stats.leavesTrend.length > 0 && (
                    <Sparkline data={stats.leavesTrend} height={20} color="#f97316">
                      <SparklineSpot spotColors={{ endSpot: "#f97316", spotColor: "rgba(249, 115, 22, 0.6)" }} />
                    </Sparkline>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Leaves */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">إجازات قادمة</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.upcomingLeaves}</div>
                <div className="flex items-center mt-2 text-orange-500 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>الأسبوع القادم</span>
                </div>
              </CardContent>
            </Card>

            {/* Expiring Contracts */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">عقود منتهية</span>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.expiringContracts}</div>
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>خلال الشهر</span>
                </div>
              </CardContent>
            </Card>

            {/* Pending Trainings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">تدريبات معلقة</span>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stats.pendingTrainings}</div>
                <div className="flex items-center mt-2 text-blue-500 text-sm">
                  <span>مسجلة للموظفين</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HROverview;
