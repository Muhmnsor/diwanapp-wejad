
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth } from "date-fns";
import { FileDownload, Loader2 } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime } from "@/utils/dateTimeUtils";

export function AttendanceReport() {
  // Set default date range to current month
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(today),
    to: today
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const { data, isLoading, exportReport } = useAttendanceReport(dateRange, selectedEmployee);

  const handleExport = async () => {
    try {
      await exportReport();
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const calculateDuration = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return "-";
    
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      // Calculate difference in milliseconds
      const diff = checkOutDate.getTime() - checkInDate.getTime();
      
      // Convert to hours and minutes
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours} ساعة ${minutes} دقيقة`;
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "-";
    }
  };

  return (
    <Card className="shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>تقرير الحضور والانصراف</CardTitle>
            <CardDescription>
              عرض سجلات الحضور والانصراف للموظفين
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={isLoading || !data || data.length === 0}
              onClick={handleExport}
            >
              <FileDownload className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div>
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="block h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">جميع الموظفين</option>
                {/* Add employee options here when available */}
              </select>
            </div>
            
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              locale="ar" 
              placeholder="اختر الفترة الزمنية"
              dir="rtl"
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : data && data.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الموظف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">تسجيل الحضور</TableHead>
                    <TableHead className="text-right">تسجيل الانصراف</TableHead>
                    <TableHead className="text-right">المدة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.employee_name}</TableCell>
                      <TableCell>
                        {record.date ? format(new Date(record.date), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_in ? formatTime(record.check_in) : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_out ? formatTime(record.check_out) : '-'}
                      </TableCell>
                      <TableCell>
                        {calculateDuration(record.check_in, record.check_out)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status === 'present' ? 'حاضر' :
                           record.status === 'late' ? 'متأخر' :
                           record.status === 'absent' ? 'غائب' :
                           record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد سجلات للفترة المحددة
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
