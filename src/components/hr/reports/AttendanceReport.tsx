
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
import { Download } from "lucide-react";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";

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
  const { data: reportData, isLoading, error } = useAttendanceReport(
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
            <Download className="h-4 w-4 ml-2" />
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
          
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p>جاري تحميل البيانات...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">حدث خطأ أثناء تحميل البيانات</p>
                <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
              </CardContent>
            </Card>
          ) : reportData?.records.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">لا توجد سجلات في النطاق الزمني المحدد</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>سجلات الحضور</CardTitle>
                <CardDescription>
                  {reportData?.records.length} سجل في النطاق الزمني المحدد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-right">الموظف</th>
                        <th className="py-2 px-4 text-right">التاريخ</th>
                        <th className="py-2 px-4 text-right">الحضور</th>
                        <th className="py-2 px-4 text-right">الانصراف</th>
                        <th className="py-2 px-4 text-right">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.records.map((record) => (
                        <tr key={record.id} className="border-b">
                          <td className="py-2 px-4">{record.employee_name}</td>
                          <td className="py-2 px-4">{format(new Date(record.attendance_date), "yyyy-MM-dd")}</td>
                          <td className="py-2 px-4">{record.check_in || "-"}</td>
                          <td className="py-2 px-4">{record.check_out || "-"}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status === 'present' ? 'حاضر' :
                               record.status === 'absent' ? 'غائب' :
                               record.status === 'late' ? 'متأخر' :
                               record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-10">
            <EmptyState
              icon={<Download className="h-8 w-8 text-muted-foreground" />}
              title="الرجاء اختيار نطاق زمني"
              description="حدد الفترة الزمنية لعرض تقرير الحضور"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
