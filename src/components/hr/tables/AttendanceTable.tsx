
import { useState } from "react";
import { useAttendanceRecords } from "@/hooks/hr/useAttendanceRecords";
import { useEmployees } from "@/hooks/hr/useEmployees";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarIcon, Download, Filter, Search, UserRound } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateWithDay } from "@/utils/dateTimeUtils";
import { formatTime } from "@/utils/dateTimeUtils";
import { exportToExcel } from "@/utils/excelExport";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ar } from "date-fns/locale";

export function AttendanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const { data: attendanceRecords, isLoading } = useAttendanceRecords(dateRange, selectedEmployeeId);
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();

  // Filter records based on search query
  const filteredRecords = attendanceRecords?.filter(record => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const employeeName = record.employees?.full_name?.toLowerCase() || '';
    
    return employeeName.includes(query);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 hover:bg-green-100 text-green-700">حاضر</Badge>;
      case 'absent':
        return <Badge variant="destructive">غائب</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 hover:bg-yellow-100 text-yellow-700">متأخر</Badge>;
      case 'leave':
        return <Badge variant="outline">إجازة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = async () => {
    if (!filteredRecords || filteredRecords.length === 0) return;
    
    // Transform data for Excel export
    const exportData = filteredRecords.map(record => ({
      'الموظف': record.employees?.full_name || '',
      'التاريخ': formatDateWithDay(record.attendance_date),
      'الحضور': record.check_in ? formatTime(record.check_in) : '-',
      'الانصراف': record.check_out ? formatTime(record.check_out) : '-',
      'الحالة': record.status === 'present' ? 'حاضر' : 
                record.status === 'absent' ? 'غائب' : 
                record.status === 'late' ? 'متأخر' : 
                record.status === 'leave' ? 'إجازة' : record.status,
      'ملاحظات': record.notes || ''
    }));
    
    // Create sheets data for the export
    const sheets = [
      {
        name: 'سجلات الحضور',
        data: exportData
      }
    ];
    
    // Generate filename with date range if selected
    let filename = 'سجلات-الحضور';
    if (dateRange?.from) {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : fromDate;
      filename += `-${fromDate}-to-${toDate}`;
    }
    
    // Export the data
    try {
      await exportToExcel(sheets, filename);
    } catch (error) {
      console.error('Error exporting attendance data:', error);
    }
  };

  const clearFilters = () => {
    setSelectedEmployeeId(undefined);
    setDateRange(undefined);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 min-w-[200px]"
            />
          </div>
          
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="min-w-[200px]">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <SelectValue placeholder="جميع الموظفين" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="undefined">جميع الموظفين</SelectItem>
              {employees?.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DateRangePicker
            locale={ar}
            dir="rtl"
            value={dateRange}
            onChange={setDateRange}
            placeholder="الفترة الزمنية"
          />
          
          {(selectedEmployeeId || dateRange) && (
            <Button variant="ghost" onClick={clearFilters} className="h-10">
              مسح التصفية
            </Button>
          )}
        </div>
        
        <Button variant="outline" onClick={handleExport} disabled={!filteredRecords || filteredRecords.length === 0}>
          <Download className="ml-2 h-4 w-4" />
          تصدير
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-8">جاري تحميل البيانات...</div>
      ) : filteredRecords && filteredRecords.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحضور</TableHead>
                <TableHead>الانصراف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employees?.full_name}</TableCell>
                  <TableCell>{formatDateWithDay(record.attendance_date)}</TableCell>
                  <TableCell dir="ltr" className="text-right">{record.check_in ? formatTime(record.check_in) : '-'}</TableCell>
                  <TableCell dir="ltr" className="text-right">{record.check_out ? formatTime(record.check_out) : '-'}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{record.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-lg mb-2">لا توجد سجلات حضور</p>
            <p className="text-sm text-muted-foreground">
              {dateRange || selectedEmployeeId ? 
                'لا توجد سجلات مطابقة لمعايير البحث المحددة' : 
                'لم يتم تسجيل أي سجلات حضور بعد'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
