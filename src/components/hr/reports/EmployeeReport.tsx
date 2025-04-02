
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeStats } from "./components/EmployeeStats";
import { EmployeeCharts } from "./components/EmployeeCharts";
import { useEmployeeReport } from "@/hooks/hr/useEmployeeReport";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function EmployeeReport({ startDate, endDate }: EmployeeReportProps) {
  const [department, setDepartment] = React.useState<"all" | "engineering" | "marketing" | "hr">("all");
  
  // Format dates for display
  const formattedStartDate = startDate ? format(startDate, 'dd MMMM yyyy', { locale: ar }) : '';
  const formattedEndDate = endDate ? format(endDate, 'dd MMMM yyyy', { locale: ar }) : '';
  
  const { data: reportData, isLoading } = useEmployeeReport(startDate, endDate);
  
  const handleExportReport = () => {
    // Export functionality would be implemented here
    console.log("Exporting employee report");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <CardTitle>
          تقرير الموظفين
          {startDate && endDate && (
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              الفترة: {formattedStartDate} إلى {formattedEndDate}
            </span>
          )}
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <Tabs value={department} onValueChange={(value) => setDepartment(value as any)}>
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="engineering">الهندسة</TabsTrigger>
              <TabsTrigger value="marketing">التسويق</TabsTrigger>
              <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {reportData && (
            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              تصدير التقرير
            </Button>
          )}
        </div>
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
              <EmployeeStats department={department} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <EmployeeCharts department={department} />
            </div>
            
            {reportData && reportData.employees.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full bg-white rounded-md overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-right">الاسم</th>
                      <th className="px-4 py-2 text-right">القسم</th>
                      <th className="px-4 py-2 text-right">المنصب</th>
                      <th className="px-4 py-2 text-right">تاريخ التعيين</th>
                      <th className="px-4 py-2 text-right">نوع العقد</th>
                      <th className="px-4 py-2 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.employees.map((employee) => (
                      <tr key={employee.id} className="border-b">
                        <td className="px-4 py-2 text-right font-medium">{employee.full_name}</td>
                        <td className="px-4 py-2 text-right">{employee.department || '-'}</td>
                        <td className="px-4 py-2 text-right">{employee.position || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          {employee.hire_date ? format(new Date(employee.hire_date), 'yyyy/MM/dd', { locale: ar }) : '-'}
                        </td>
                        <td className="px-4 py-2 text-right">{employee.contract_type || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
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
