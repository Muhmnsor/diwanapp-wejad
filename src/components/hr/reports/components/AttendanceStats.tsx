// src/components/hr/reports/components/AttendanceStats.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertTriangle } from "lucide-react";
import { useAttendanceStats } from "@/hooks/hr/useAttendanceStats";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceStatsProps {
  period: "daily" | "weekly" | "monthly";
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceStats({ period, startDate, endDate }: AttendanceStatsProps) {
  const { data: stats, isLoading, isError } = useAttendanceStats(period, startDate, endDate);

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-[140px] w-full" />
        <Skeleton className="h-[140px] w-full" />
        <Skeleton className="h-[140px] w-full" />
      </>
    );
  }

  if (isError || !stats) {
    return (
      <div className="col-span-3 p-4 text-center text-red-500">
        <p>حدث خطأ أثناء تحميل بيانات الحضور</p>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحضور</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.presentCount}</div>
          <p className="text-xs text-muted-foreground">
            موظف حاضر خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التأخير</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lateCount}</div>
          <p className="text-xs text-muted-foreground">
            حالة تأخير خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الغياب</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.absentCount}</div>
          <p className="text-xs text-muted-foreground">
            حالة غياب خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
