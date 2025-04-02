
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReport } from "./AttendanceReport";
import { EmployeeReport } from "./EmployeeReport";
import { LeaveReport } from "./LeaveReport";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { useState } from "react";

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
  // Local state to manage the date range and employee selection if none provided
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(dateRange);
  const [localEmployeeId, setLocalEmployeeId] = useState<string | undefined>(selectedEmployeeId);

  // Handle local date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setLocalDateRange(range);
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  // Handle local employee change
  const handleEmployeeChange = (employeeId: string | undefined) => {
    setLocalEmployeeId(employeeId);
    if (onEmployeeChange) {
      onEmployeeChange(employeeId);
    }
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
            <AttendanceReport 
              startDate={dateRange?.from || localDateRange?.from}
              endDate={dateRange?.to || localDateRange?.to}
              employeeId={selectedEmployeeId || localEmployeeId}
              onDateRangeChange={handleDateRangeChange}
              onEmployeeChange={handleEmployeeChange}
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
