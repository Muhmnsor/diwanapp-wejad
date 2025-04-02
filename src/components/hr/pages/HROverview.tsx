
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

  // Ensure stats is defined with fallback values
  const safeStats = stats || {
    employeeCount: 0,
    attendanceRate: 0,
    activeLeaves: 0,
    turnoverRate: 0,
    employeeTrend: [0],
    attendanceTrend: [0],
    leavesTrend: [0],
    turnoverTrend: [0]
  };

  // Helper function to check if trend data is valid for rendering spots
  const canRenderSpots = (data: number[]) => {
    return Array.isArray(data) && data.length > 1;
  };

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
            <div className="text-2xl font-bold">{safeStats.employeeCount}</div>
            {safeStats.employeeTrend && safeStats.employeeTrend.length > 0 ? (
              <Sparkline 
                data={safeStats.employeeTrend} 
                height={40} 
                className="mt-2"
              >
                {canRenderSpots(safeStats.employeeTrend) && <SparklineSpot />}
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
            <div className="text-2xl font-bold">{safeStats.attendanceRate ? `${safeStats.attendanceRate.toFixed(1)}%` : '0%'}</div>
            {safeStats.attendanceTrend && safeStats.attendanceTrend.length > 0 ? (
              <Sparkline 
                data={safeStats.attendanceTrend} 
                height={40} 
                className="mt-2" 
                color="#3b82f6"
              >
                {canRenderSpots(safeStats.attendanceTrend) && (
                  <SparklineSpot spotColors={{ endSpot: "#3b82f6", spotColor: "rgba(59, 130, 246, 0.6)" }} />
                )}
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
            <div className="text-2xl font-bold">{safeStats.activeLeaves}</div>
            {safeStats.leavesTrend && safeStats.leavesTrend.length > 0 ? (
              <Sparkline 
                data={safeStats.leavesTrend} 
                height={40} 
                className="mt-2" 
                color="#f97316"
              >
                {canRenderSpots(safeStats.leavesTrend) && (
                  <SparklineSpot spotColors={{ endSpot: "#f97316", spotColor: "rgba(249, 115, 22, 0.6)" }} />
                )}
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
            <div className="text-2xl font-bold">{safeStats.turnoverRate ? `${safeStats.turnoverRate.toFixed(1)}%` : '0%'}</div>
            {safeStats.turnoverTrend && safeStats.turnoverTrend.length > 0 ? (
              <Sparkline 
                data={safeStats.turnoverTrend} 
                height={40} 
                className="mt-2" 
                color="#ec4899"
              >
                {canRenderSpots(safeStats.turnoverTrend) && (
                  <SparklineSpot spotColors={{ endSpot: "#ec4899", spotColor: "rgba(236, 72, 153, 0.6)" }} />
                )}
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
