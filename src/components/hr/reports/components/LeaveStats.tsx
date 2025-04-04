// src/components/hr/reports/components/LeaveStats.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Briefcase } from "lucide-react";
import { useLeaveStats } from "@/hooks/hr/useLeaveStats";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaveStatsProps {
  period: "yearly" | "quarterly" | "monthly";
  startDate?: Date;
  endDate?: Date;
}

export function LeaveStats({ period, startDate, endDate }: LeaveStatsProps) {
  const { data: stats, isLoading, isError } = useLeaveStats(period, startDate, endDate);

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
        <p>حدث خطأ أثناء تحميل بيانات الإجازات</p>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإجازات</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            إجازة خلال {period === "yearly" ? "السنة" : period === "quarterly" ? "الربع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الإجازات المعتمدة</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}% من إجمالي الإجازات
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}% من إجمالي الإجازات
          </p>
        </CardContent>
      </Card>
    </>
  );
}
