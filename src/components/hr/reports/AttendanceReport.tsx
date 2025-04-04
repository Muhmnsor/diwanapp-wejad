// src/components/hr/reports/AttendanceReport.tsx
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, Users, Clock } from "lucide-react";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceCharts } from "./components/AttendanceCharts";
import { IndividualAttendanceReport } from "./components/IndividualAttendanceReport";

// Add props interface
interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceReport({ startDate, endDate }: AttendanceReportProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [reportType, setReportType] = useState<"general" | "individual">("general");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الحضور</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الحضور والانصراف للموظفين
          </p>
        </div>
        
        <Tabs value={reportType} onValueChange={(v) => setReportType(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">تقرير عام</TabsTrigger>
            <TabsTrigger value="individual">تقرير فردي</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabsContent value="general" className="space-y-4">
        <div className="flex justify-end">
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
      </TabsContent>
      
      <TabsContent value="individual">
        {/* Pass startDate and endDate to the IndividualAttendanceReport component */}
        <IndividualAttendanceReport initialStartDate={startDate} initialEndDate={endDate} />
      </TabsContent>
    </div>
  );
}
