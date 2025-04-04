// src/components/hr/reports/components/IndividualAttendanceReport.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeAttendanceReport } from "@/hooks/hr/useEmployeeAttendanceReport";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

// Add props interface
interface IndividualAttendanceReportProps {
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function IndividualAttendanceReport({ initialStartDate, initialEndDate }: IndividualAttendanceReportProps) {
  const [employeeId, setEmployeeId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  
  // Initialize dates from props when available
  useEffect(() => {
    if (initialStartDate) setStartDate(initialStartDate);
    if (initialEndDate) setEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate]);
  
  // Fetch employees list
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  
  // Fetch attendance data
  const { 
    data: reportData, 
    isLoading: isLoadingReport,
    isError,
    error
  } = useEmployeeAttendanceReport(
    isReportGenerated ? employeeId : undefined, 
    isReportGenerated ? startDate : undefined, 
    isReportGenerated ? endDate : undefined
  );
  
  const handleGenerateReport = () => {
    if (employeeId && startDate && endDate) {
      setIsReportGenerated(true);
    }
  };
  
  const resetReport = () => {
    setIsReportGenerated(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تقرير الحضور الفردي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">الموظف</label>
              <Select value={employeeId} onValueChange={setEmployeeId} disabled={isReportGenerated}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                  ) : (
                    employees?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <DatePicker
                date={startDate}
                onSelect={setStartDate}
                disabled={isReportGenerated}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <DatePicker
                date={endDate}
                onSelect={setEndDate}
                disabled={isReportGenerated}
              />
            </div>
            
            <div className="flex items-end space-x-2 rtl:space-x-reverse">
              {!isReportGenerated ? (
                <Button onClick={handleGenerateReport} disabled={!employeeId || !startDate || !endDate}>
                  إنشاء التقرير
                </Button>
              ) : (
                <Button variant="outline" onClick={resetReport}>
                  تقرير جديد
                </Button>
              )}
            </div>
          </div>
          
          {isReportGenerated && (
            <div className="space-y-6">
              {isLoadingReport ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : isError ? (
                <div className="p-4 text-center text-red-500">
                  <p>حدث خطأ أثناء إنشاء التقرير</p>
                  <p className="text-sm">{error?.message}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">أيام الحضور</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{reportData?.presentDays}</div>
                        <p className="text-xs text-muted-foreground">
                          من إجمالي {reportData?.totalDays} يوم
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">أيام الغياب</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{reportData?.absentDays}</div>
                        <p className="text-xs text-muted-foreground">
                          من إجمالي {reportData?.totalDays} يوم
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">حالات التأخير</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{reportData?.lateDays}</div>
                        <p className="text-xs text-muted-foreground">
                          مرة تأخير خلال الفترة
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ساعات العمل</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{reportData?.totalWorkHours}</div>
                        <p className="text-xs text-muted-foreground">
                          ساعة عمل خلال الفترة
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>سجلات الحضور والانصراف</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                التاريخ
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                وقت الحضور
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                وقت الانصراف
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                الحالة
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ملاحظات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {reportData?.records.map(record => (
                              <tr key={record.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {format(new Date(record.attendance_date), 'yyyy/MM/dd', { locale: ar })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.check_in ? format(new Date(record.check_in), 'HH:mm') : 'غير مسجل'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.check_out ? format(new Date(record.check_out), 'HH:mm') : 'غير مسجل'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    record.status === 'present' ? 'bg-green-100 text-green-800' : 
                                    record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                                    record.status === 'late' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {record.status === 'present' ? 'حاضر' : 
                                     record.status === 'absent' ? 'غائب' : 
                                     record.status === 'late' ? 'متأخر' : record.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
