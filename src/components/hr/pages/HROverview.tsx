
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state"; 
import { Users, Clock, Calendar, AlertCircle } from "lucide-react";
import { useHRStats } from "@/hooks/hr/useHRStats";

export default function HROverview() {
  const { data: stats, isLoading, error } = useHRStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-20 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-10 w-10 text-destructive" />}
        title="خطأ في تحميل البيانات"
        description="حدث خطأ أثناء تحميل إحصائيات الموارد البشرية. يرجى المحاولة مرة أخرى."
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 space-x-reverse">
              <Users className="h-4 w-4 ml-1" />
              <span>إجمالي الموظفين</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.employeeCount || 0}</div>
            {stats?.employeeTrend && stats.employeeTrend.length > 0 ? (
              <Sparkline data={stats.employeeTrend} height={40} className="mt-2">
                <SparklineSpot />
              </Sparkline>
            ) : (
              <div className="h-10 text-xs text-muted-foreground mt-2">لا توجد بيانات للاتجاه</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 space-x-reverse">
              <Clock className="h-4 w-4 ml-1" />
              <span>معدل الحضور</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate ? `${stats.attendanceRate.toFixed(1)}%` : '0%'}</div>
            {stats?.attendanceTrend && stats.attendanceTrend.length > 0 ? (
              <Sparkline data={stats.attendanceTrend} height={40} className="mt-2" color="#3b82f6">
                <SparklineSpot spotColors={{ endSpot: "#3b82f6", spotColor: "rgba(59, 130, 246, 0.6)" }} />
              </Sparkline>
            ) : (
              <div className="h-10 text-xs text-muted-foreground mt-2">لا توجد بيانات للاتجاه</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 space-x-reverse">
              <Calendar className="h-4 w-4 ml-1" />
              <span>الإجازات النشطة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
            {stats?.leavesTrend && stats.leavesTrend.length > 0 ? (
              <Sparkline data={stats.leavesTrend} height={40} className="mt-2" color="#f97316">
                <SparklineSpot spotColors={{ endSpot: "#f97316", spotColor: "rgba(249, 115, 22, 0.6)" }} />
              </Sparkline>
            ) : (
              <div className="h-10 text-xs text-muted-foreground mt-2">لا توجد بيانات للاتجاه</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 space-x-reverse">
              <Users className="h-4 w-4 ml-1" />
              <span>معدل دوران الموظفين</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.turnoverRate ? `${stats.turnoverRate.toFixed(1)}%` : '0%'}</div>
            {stats?.turnoverTrend && stats.turnoverTrend.length > 0 ? (
              <Sparkline data={stats.turnoverTrend} height={40} className="mt-2" color="#ec4899">
                <SparklineSpot spotColors={{ endSpot: "#ec4899", spotColor: "rgba(236, 72, 153, 0.6)" }} />
              </Sparkline>
            ) : (
              <div className="h-10 text-xs text-muted-foreground mt-2">لا توجد بيانات للاتجاه</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
