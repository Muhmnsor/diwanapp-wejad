
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AttendanceStatsProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

export function AttendanceStats({ startDate, endDate, employeeId }: AttendanceStatsProps) {
  const { data, isLoading } = useAttendanceReport(startDate, endDate, employeeId);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-1/2 bg-muted rounded mb-3"></div>
              <div className="h-8 w-1/3 bg-muted rounded mb-2"></div>
              <div className="h-3 w-1/4 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (!data) {
    return null;
  }
  
  const statsItems = [
    {
      title: "إجمالي السجلات",
      value: data.stats.totalRecords,
      badge: "",
      badgeVariant: "default",
    },
    {
      title: "الحضور",
      value: data.stats.presentCount,
      badge: `${data.stats.presentPercentage.toFixed(1)}%`,
      badgeVariant: "success",
    },
    {
      title: "الغياب",
      value: data.stats.absentCount,
      badge: `${data.stats.absentPercentage.toFixed(1)}%`,
      badgeVariant: "destructive",
    },
    {
      title: "التأخير",
      value: data.stats.lateCount,
      badge: `${data.stats.latePercentage.toFixed(1)}%`,
      badgeVariant: "secondary",
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              {item.badge && (
                <Badge variant={item.badgeVariant as any}>{item.badge}</Badge>
              )}
            </div>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
