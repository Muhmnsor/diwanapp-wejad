
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format, addDays, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceCharts } from "./components/AttendanceCharts";
import { EmployeeSelector } from "./components/EmployeeSelector";
import { EmptyState } from "@/components/ui/empty-state";
import { FileSpreadsheet } from "lucide-react";

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  onEmployeeChange?: (employeeId: string | undefined) => void;
}

export function AttendanceReport({ 
  startDate, 
  endDate, 
  employeeId,
  onDateRangeChange,
  onEmployeeChange
}: AttendanceReportProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    startDate && endDate 
      ? { from: startDate, to: endDate } 
      : { from: addDays(new Date(), -30), to: new Date() }
  );

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(employeeId);

  // Update parent component with date range changes
  useEffect(() => {
    if (onDateRangeChange && dateRange) {
      onDateRangeChange(dateRange);
    }
  }, [dateRange, onDateRangeChange]);

  // Update parent component with employee changes
  useEffect(() => {
    if (onEmployeeChange) {
      onEmployeeChange(selectedEmployeeId);
    }
  }, [selectedEmployeeId, onEmployeeChange]);

  // Handle date range change locally
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);
  };

  // Handle employee change locally
  const handleEmployeeChange = (newEmployeeId: string | undefined) => {
    setSelectedEmployeeId(newEmployeeId);
  };

  const exportReport = async () => {
    // Placeholder for export functionality
    console.log("Exporting attendance report...");
    console.log("Date range:", dateRange);
    console.log("Employee ID:", selectedEmployeeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          align="start"
          locale="ar"
          placeholder="اختر نطاق التاريخ"
        />
        <div className="flex gap-4">
          <EmployeeSelector
            value={selectedEmployeeId}
            onChange={handleEmployeeChange}
          />
          <Button 
            variant="outline" 
            className="w-[140px]"
            onClick={exportReport}
          >
            <FileSpreadsheet className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {dateRange ? (
        <>
          <AttendanceStats 
            startDate={dateRange.from} 
            endDate={dateRange.to} 
            employeeId={selectedEmployeeId}
          />
          
          <AttendanceCharts 
            startDate={dateRange.from} 
            endDate={dateRange.to}
            employeeId={selectedEmployeeId}
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<FileSpreadsheet className="h-8 w-8 text-muted-foreground" />}
              title="الرجاء اختيار نطاق زمني"
              description="حدد الفترة الزمنية لعرض تقرير الحضور"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
