
// src/components/hr/reports/components/EmployeeStats.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck } from "lucide-react";
import { useEmployeeStats } from "@/hooks/hr/useEmployeeStats";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeStatsProps {
  unitId: string | "all";
}

export function EmployeeStats({ unitId }: EmployeeStatsProps) {
  const { data: stats, isLoading, isError } = useEmployeeStats(unitId);

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
        <p>حدث خطأ أثناء تحميل بيانات الموظفين</p>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {unitId === "all" ? "في جميع الإدارات" : "في الإدارة المختارة"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الموظفين النشطين</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% من إجمالي الموظفين
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.onLeave}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total ? Math.round((stats.onLeave / stats.total) * 100) : 0}% من إجمالي الموظفين
          </p>
        </CardContent>
      </Card>
    </>
  );
}
