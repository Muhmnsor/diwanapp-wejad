
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReport } from "./AttendanceReport";
import { EmployeeReport } from "./EmployeeReport";
import { LeaveReport } from "./LeaveReport";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface HRReportsProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  selectedEmployeeId?: string;
  onEmployeeChange?: (employeeId: string | undefined) => void;
}

export function HRReports({ 
  dateRange, 
  onDateRangeChange,
  selectedEmployeeId,
  onEmployeeChange
}: HRReportsProps) {
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
            <AttendanceReport 
              startDate={dateRange?.from} 
              endDate={dateRange?.to}
              employeeId={selectedEmployeeId}
              onDateRangeChange={onDateRangeChange}
              onEmployeeChange={onEmployeeChange}
            />
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
