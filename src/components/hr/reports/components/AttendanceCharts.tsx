// src/components/hr/reports/components/AttendanceCharts.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAttendanceChartData } from "@/hooks/hr/useAttendanceChartData";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceChartsProps {
  period: "daily" | "weekly" | "monthly";
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceCharts({ period, startDate, endDate }: AttendanceChartsProps) {
  const { data: chartData, isLoading, isError } = useAttendanceChartData(period, startDate, endDate);
  
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>الحضور والغياب</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !chartData) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>الحضور والغياب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الرسم البياني</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Select data based on period
  const data = period === 'daily' 
    ? chartData.daily 
    : period === 'weekly' 
      ? chartData.weekly 
      : chartData.monthly;
  
  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>الحضور والغياب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#4ade80" name="حضور" />
                <Bar dataKey="late" fill="#facc15" name="تأخير" />
                <Bar dataKey="absent" fill="#f87171" name="غياب" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
