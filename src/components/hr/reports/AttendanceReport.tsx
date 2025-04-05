// src/components/hr/reports/AttendanceReport.tsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceCharts } from "./components/AttendanceCharts";

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceReport({ startDate, endDate }: AttendanceReportProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الحضور</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الحضور والانصراف للموظفين
          </p>
        </div>
        
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AttendanceStats period={period} startDate={startDate} endDate={endDate} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <AttendanceCharts period={period} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
}
