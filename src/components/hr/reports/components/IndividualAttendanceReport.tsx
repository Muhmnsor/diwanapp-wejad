
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeAttendanceReport } from "@/hooks/hr/useEmployeeAttendanceReport";
import { UserCheck, Download, Calendar, Clock } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
}

interface IndividualAttendanceReportProps {
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function IndividualAttendanceReport({ initialStartDate, initialEndDate }: IndividualAttendanceReportProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const { toast } = useToast();

  const { 
    data: employees,
    isLoading: isEmployeesLoading,
    error: employeesError 
  } = useQuery<Employee[], Error>({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, position, department')
        .order('full_name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    }
  });

  const {
    data: attendanceReport,
    isLoading: isReportLoading,
    isError: isReportError,
    refetch: refetchReport
  } = useEmployeeAttendanceReport(selectedEmployee, startDate, endDate);

  // Handle report generation
  const handleGenerateReport = () => {
    if (!selectedEmployee) {
      toast({
        title: "تحديد الموظف مطلوب",
        description: "يرجى اختيار موظف لإنشاء التقرير",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "تحديد التاريخ مطلوب",
        description: "يرجى تحديد تاريخ البداية والنهاية للتقرير",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "خطأ في التاريخ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive",
      });
      return;
    }

    refetchReport();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "hh:mm a", { locale: ar });
    } catch (e) {
      return "—";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "yyyy/MM/dd", { locale: ar });
    } catch (e) {
      return "—";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "present": return "text-green-600";
      case "absent": return "text-red-600";
      case "late": return "text-orange-500";
      case "leave": return "text-blue-500";
      default: return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present": return "حاضر";
      case "absent": return "غائب";
      case "late": return "متأخر";
      case "leave": return "إجازة";
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> تقرير الحضور الفردي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">الموظف</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {isEmployeesLoading ? (
                    <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                  ) : employeesError ? (
                    <SelectItem value="error" disabled>حدث خطأ في تحميل البيانات</SelectItem>
                  ) : employees?.length === 0 ? (
                    <SelectItem value="empty" disabled>لا يوجد موظفين</SelectItem>
                  ) : (
                    employees?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.department}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">تاريخ البداية</Label>
              <DatePicker 
                date={startDate} 
                setDate={setStartDate} 
                locale="ar" 
                placeholder="اختر تاريخ البداية" 
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-2">تاريخ النهاية</Label>
              <DatePicker 
                date={endDate} 
                setDate={setEndDate} 
                locale="ar" 
                placeholder="اختر تاريخ النهاية" 
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGenerateReport}>
              <Calendar className="ml-2 h-4 w-4" />
              عرض التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {selectedEmployee && startDate && endDate && (
        <>
          {/* Statistics Cards */}
          {isReportLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-[100px] mb-2" />
                    <Skeleton className="h-8 w-[60px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isReportError ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32 text-center">
                <div className="text-red-500">حدث خطأ أثناء تحميل بيانات التقرير. يرجى المحاولة مرة أخرى.</div>
              </CardContent>
            </Card>
          ) : attendanceReport ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">إجمالي الأيام</div>
                    <div className="text-2xl font-bold mt-1">{attendanceReport.totalDays}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">أيام الحضور</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">{attendanceReport.presentDays}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">أيام الغياب</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">{attendanceReport.absentDays}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">أيام التأخير</div>
                    <div className="text-2xl font-bold text-orange-500 mt-1">{attendanceReport.lateDays}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">إجمالي ساعات العمل</div>
                        <div className="text-2xl font-bold text-primary mt-1">{attendanceReport.totalWorkHours}</div>
                      </div>
                      <Clock className="ml-auto h-8 w-8 text-muted-foreground opacity-30" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Records Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>سجلات الحضور</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 ml-2" />
                    تصدير البيانات
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">التاريخ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>وقت الحضور</TableHead>
                        <TableHead>وقت الإنصراف</TableHead>
                        <TableHead>ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceReport.records.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            لا توجد سجلات حضور للفترة المحددة
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceReport.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.attendance_date)}</TableCell>
                            <TableCell className={getStatusClass(record.status)}>
                              {getStatusText(record.status)}
                            </TableCell>
                            <TableCell>{formatTime(record.check_in)}</TableCell>
                            <TableCell>{formatTime(record.check_out)}</TableCell>
                            <TableCell>{record.notes || '—'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32 text-center">
                <div className="text-muted-foreground">اختر موظف وفترة زمنية لعرض التقرير</div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
