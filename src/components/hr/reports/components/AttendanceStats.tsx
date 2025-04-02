
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertTriangle } from "lucide-react";

interface AttendanceStatsProps {
  period: "daily" | "weekly" | "monthly";
  employeeStats?: {
    employee_name: string;
    present: number;
    absent: number;
    late: number;
    leave: number;
  }[];
}

export function AttendanceStats({ period, employeeStats }: AttendanceStatsProps) {
  // If employee specific stats are provided, use them
  const stats = employeeStats && employeeStats.length === 1
    ? {
        presentCount: employeeStats[0].present,
        lateCount: employeeStats[0].late,
        absentCount: employeeStats[0].absent,
        averageWorkHours: period === "daily" ? 7.5 : period === "weekly" ? 37.5 : 150
      }
    : {
        presentCount: period === "daily" ? 18 : period === "weekly" ? 85 : 340,
        lateCount: period === "daily" ? 3 : period === "weekly" ? 12 : 45,
        absentCount: period === "daily" ? 2 : period === "weekly" ? 8 : 30,
        averageWorkHours: period === "daily" ? 7.5 : period === "weekly" ? 37.5 : 150
      };
  
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
            {employeeStats && employeeStats.length === 1 ? "أيام الحضور" : "موظف حاضر"} خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
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
            {employeeStats && employeeStats.length === 1 ? "أيام التأخير" : "حالة تأخير"} خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
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
            {employeeStats && employeeStats.length === 1 ? "أيام الغياب" : "حالة غياب"} خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
