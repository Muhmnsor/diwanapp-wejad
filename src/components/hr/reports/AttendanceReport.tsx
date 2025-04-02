
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceCharts } from "./components/AttendanceCharts";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceReport({ startDate, endDate }: AttendanceReportProps) {
  const [reportPeriod, setReportPeriod] = React.useState<"daily" | "weekly" | "monthly">("daily");
  
  // Format dates for display
  const formattedStartDate = startDate ? format(startDate, 'dd MMMM yyyy', { locale: ar }) : '';
  const formattedEndDate = endDate ? format(endDate, 'dd MMMM yyyy', { locale: ar }) : '';
  
  const { data: reportData, isLoading } = useAttendanceReport(startDate, endDate);
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <CardTitle>
          تقرير الحضور
          {startDate && endDate && (
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              الفترة: {formattedStartDate} إلى {formattedEndDate}
            </span>
          )}
        </CardTitle>
        
        <Tabs value={reportPeriod} onValueChange={(value) => setReportPeriod(value as any)} className="mt-4 sm:mt-0">
          <TabsList>
            <TabsTrigger value="daily">يومي</TabsTrigger>
            <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
            <TabsTrigger value="monthly">شهري</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        {!startDate || !endDate ? (
          <div className="text-center text-muted-foreground py-10">
            يرجى تحديد تاريخ البداية والنهاية لعرض التقرير
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-80" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <AttendanceStats period={reportPeriod} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttendanceCharts period={reportPeriod} />
            </div>
            
            {reportData && reportData.records.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full bg-white rounded-md overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-right">الموظف</th>
                      <th className="px-4 py-2 text-right">التاريخ</th>
                      <th className="px-4 py-2 text-right">الحضور</th>
                      <th className="px-4 py-2 text-right">الانصراف</th>
                      <th className="px-4 py-2 text-right">الحالة</th>
                      <th className="px-4 py-2 text-right">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="px-4 py-2 text-right">{record.employee_name}</td>
                        <td className="px-4 py-2 text-right">{format(new Date(record.attendance_date), 'yyyy/MM/dd', { locale: ar })}</td>
                        <td className="px-4 py-2 text-right">{record.check_in || '-'}</td>
                        <td className="px-4 py-2 text-right">{record.check_out || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status === 'present' ? 'حاضر' :
                             record.status === 'absent' ? 'غائب' :
                             record.status === 'late' ? 'متأخر' : 'إجازة'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">{record.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                لا توجد بيانات للفترة المحددة
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
