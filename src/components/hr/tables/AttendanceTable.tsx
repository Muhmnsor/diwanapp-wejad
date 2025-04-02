
import { useAttendanceRecords } from "@/hooks/hr/useAttendanceRecords";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CalendarIcon, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateWithDay, formatTime } from "@/utils/dateTimeUtils";
import { ExportButton } from "@/components/admin/ExportButton";
import { ImportAttendanceDialog } from "../dialogs/ImportAttendanceDialog";
import { ExportAttendanceDialog } from "../dialogs/ExportAttendanceDialog";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { addDays } from "date-fns";

export function AttendanceTable() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  const { data, isLoading, error, refetch } = useAttendanceRecords(dateRange, selectedEmployeeId);
  const { data: permissions } = useHRPermissions();
  const { data: employees } = useEmployees();

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setTimeout(() => refetch(), 100);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId === "all" ? undefined : employeeId);
    setTimeout(() => refetch(), 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">حدث خطأ أثناء تحميل سجلات الحضور</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      present: { label: "حاضر", variant: "default" },
      absent: { label: "غائب", variant: "destructive" },
      late: { label: "متأخر", variant: "secondary" },
      leave: { label: "إجازة", variant: "outline" }
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Prepare data for export
  const exportData = (data || []).map(record => ({
    الموظف: record.employees?.full_name || 'غير محدد',
    التاريخ: formatDateWithDay(record.attendance_date),
    وقت_الحضور: formatTime(record.check_in),
    وقت_الانصراف: formatTime(record.check_out),
    الحالة: record.status === 'present' ? 'حاضر' : 
           record.status === 'absent' ? 'غائب' : 
           record.status === 'late' ? 'متأخر' : 
           record.status === 'leave' ? 'إجازة' : record.status,
    ملاحظات: record.notes || ''
  }));

  const canManageAttendance = permissions?.canManageAttendance || permissions?.isAdmin;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="اختر نطاق التاريخ"
              align="start"
              locale="ar"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <Select onValueChange={handleEmployeeChange} defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع الموظفين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          {canManageAttendance && <ImportAttendanceDialog />}
          <ExportAttendanceDialog />
          <ExportButton data={exportData} filename="سجلات_الحضور" />
        </div>
      </div>
      
      {(!data || data.length === 0) ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">لا توجد سجلات حضور</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">وقت الحضور</TableHead>
                <TableHead className="text-right">وقت الانصراف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-right">
                    {record.employees?.full_name || 'غير محدد'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDateWithDay(record.attendance_date)}
                  </TableCell>
                  <TableCell className="text-right">{formatTime(record.check_in)}</TableCell>
                  <TableCell className="text-right">{formatTime(record.check_out)}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-right">
                    {record.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
