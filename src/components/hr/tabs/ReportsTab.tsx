import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/tasks/reports/components/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReport } from "../reports/AttendanceReport";
import { EmployeeReport } from "../reports/EmployeeReport";
import { LeaveReport } from "../reports/LeaveReport";

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function ReportsTab() {
  const [datePeriod, setDatePeriod] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  const handleDateRangeChange = (range: DateRange) => {
    setDatePeriod(range);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">تقارير الحضور</TabsTrigger>
            <TabsTrigger value="employees">تقارير الموظفين</TabsTrigger>
            <TabsTrigger value="leaves">تقارير الإجازات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="space-y-4">
            <AttendanceReport />
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4">
            <EmployeeReport />
          </TabsContent>
          
          <TabsContent value="leaves" className="space-y-4">
            <LeaveReport />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
