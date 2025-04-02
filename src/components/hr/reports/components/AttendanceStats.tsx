
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, UserCheck, UserX, AlertTriangle } from "lucide-react";

interface AttendanceStatsProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

export function AttendanceStats({ startDate, endDate, employeeId }: AttendanceStatsProps) {
  // Get attendance statistics within date range
  const { data: stats, isLoading } = useQuery({
    queryKey: ['attendance-stats', startDate?.toISOString(), endDate?.toISOString(), employeeId],
    queryFn: async () => {
      if (!startDate || !endDate) return null;

      console.log(`Fetching attendance stats from ${startDate} to ${endDate} for employee ${employeeId || 'all'}`);
      
      let query = supabase
        .from('employee_attendance')
        .select('*')
        .gte('check_in_time', startDate.toISOString())
        .lte('check_in_time', endDate.toISOString());
      
      // Add employee filter if provided
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching attendance stats:", error);
        throw error;
      }
      
      // Calculate statistics
      const totalAttendance = data.length;
      const lateAttendance = data.filter(record => record.late_minutes > 0).length;
      const absenceDays = 0; // This would need a more complex query to determine absences
      const problemDays = data.filter(record => record.weekend || record.holiday).length;
      
      return {
        totalAttendance,
        lateAttendance,
        absenceDays,
        problemDays
      };
    },
    enabled: !!startDate && !!endDate
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            إجمالي أيام الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {stats?.totalAttendance || 0}
              <span className="text-sm text-muted-foreground mr-1">يوم</span>
            </div>
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {startDate && endDate ? (
              <>
                {format(startDate, "d MMM", { locale: ar })} -{" "}
                {format(endDate, "d MMM yyyy", { locale: ar })}
              </>
            ) : (
              "لا يوجد نطاق زمني محدد"
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            أيام التأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {stats?.lateAttendance || 0}
              <span className="text-sm text-muted-foreground mr-1">يوم</span>
            </div>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats && stats.totalAttendance > 0 ? (
              `${Math.round((stats.lateAttendance / stats.totalAttendance) * 100)}% من إجمالي أيام الحضور`
            ) : (
              "لا توجد بيانات"
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            أيام الغياب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {stats?.absenceDays || 0}
              <span className="text-sm text-muted-foreground mr-1">يوم</span>
            </div>
            <UserX className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            تحتاج لتحسين قياس أيام الغياب
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            أيام استثنائية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {stats?.problemDays || 0}
              <span className="text-sm text-muted-foreground mr-1">يوم</span>
            </div>
            <AlertTriangle className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            أيام العطل الرسمية وعطل نهاية الأسبوع
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
