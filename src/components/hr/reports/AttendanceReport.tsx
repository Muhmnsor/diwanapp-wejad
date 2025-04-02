
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
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { exportToExcel } from "@/utils/excelExport";

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
  const { data: reportData, isLoading } = useAttendanceReport(
    dateRange?.from, 
    dateRange?.to, 
    selectedEmployeeId
  );

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
    if (!reportData || !dateRange?.from || !dateRange?.to) return;
    
    const { records, stats } = reportData;
    
    // Prepare attendance data for export
    const attendanceData = records.map(record => ({
      'اسم الموظف': record.employee_name,
      'التاريخ': format(new Date(record.attendance_date), 'yyyy-MM-dd'),
      'وقت الحضور': record.check_in ? format(new Date(record.check_in), 'HH:mm') : '-',
      'وقت الانصراف': record.check_out ? format(new Date(record.check_out), 'HH:mm') : '-',
      'الحالة': record.status === 'present' ? 'حاضر' : 
                record.status === 'absent' ? 'غائب' : 
                record.status === 'late' ? 'متأخر' : 
                record.status === 'leave' ? 'إجازة' : record.status
    }));
    
    // Prepare stats data for export
    const statsData = [{
      'إجمالي السجلات': stats.totalRecords,
      'عدد الحضور': stats.presentCount,
      'نسبة الحضور': `${stats.presentPercentage.toFixed(2)}%`,
      'عدد الغياب': stats.absentCount,
      'نسبة الغياب': `${stats.absentPercentage.toFixed(2)}%`,
      'عدد التأخير': stats.lateCount,
      'نسبة التأخير': `${stats.latePercentage.toFixed(2)}%`,
      'الفترة': `${format(dateRange.from, 'yyyy-MM-dd')} إلى ${format(dateRange.to, 'yyyy-MM-dd')}`
    }];
    
    // Export to Excel with multiple sheets
    await exportToExcel(
      [
        { name: 'ملخص الحضور', data: statsData },
        { name: 'سجلات الحضور', data: attendanceData }
      ],
      `تقرير_الحضور_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
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
            disabled={isLoading || !reportData}
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
