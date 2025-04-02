
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveStats } from "./components/LeaveStats";
import { LeaveCharts } from "./components/LeaveCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface LeaveReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function LeaveReport({ startDate, endDate }: LeaveReportProps) {
  const [period, setPeriod] = React.useState<"monthly" | "quarterly" | "yearly">("monthly");
  
  // Format dates for display
  const formattedStartDate = startDate ? format(startDate, 'dd MMMM yyyy', { locale: ar }) : '';
  const formattedEndDate = endDate ? format(endDate, 'dd MMMM yyyy', { locale: ar }) : '';
  
  // In a real app, we would use a query hook to fetch leave data
  const isLoading = false;
  
  const handleExportReport = () => {
    // Export functionality would be implemented here
    console.log("Exporting leave report");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <CardTitle>
          تقرير الإجازات
          {startDate && endDate && (
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              الفترة: {formattedStartDate} إلى {formattedEndDate}
            </span>
          )}
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
            <TabsList>
              <TabsTrigger value="monthly">شهري</TabsTrigger>
              <TabsTrigger value="quarterly">ربع سنوي</TabsTrigger>
              <TabsTrigger value="yearly">سنوي</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
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
              <LeaveStats period={period} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <LeaveCharts period={period} />
            </div>
            
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full bg-white rounded-md overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-right">الموظف</th>
                    <th className="px-4 py-2 text-right">نوع الإجازة</th>
                    <th className="px-4 py-2 text-right">تاريخ البداية</th>
                    <th className="px-4 py-2 text-right">تاريخ النهاية</th>
                    <th className="px-4 py-2 text-right">عدد الأيام</th>
                    <th className="px-4 py-2 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data - in a real app this would come from an API */}
                  <tr className="border-b">
                    <td className="px-4 py-2 text-right font-medium">أحمد محمد</td>
                    <td className="px-4 py-2 text-right">إجازة سنوية</td>
                    <td className="px-4 py-2 text-right">١٠/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">١٥/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">٥</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        معتمدة
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-right font-medium">سارة أحمد</td>
                    <td className="px-4 py-2 text-right">إجازة مرضية</td>
                    <td className="px-4 py-2 text-right">٠٥/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">٠٧/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">٣</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        معتمدة
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 text-right font-medium">خالد علي</td>
                    <td className="px-4 py-2 text-right">إجازة استثنائية</td>
                    <td className="px-4 py-2 text-right">٢٠/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">٢٠/٠٤/٢٠٢٥</td>
                    <td className="px-4 py-2 text-right">١</td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        قيد الانتظار
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
