
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCashFlow } from "@/hooks/accounting/useCashFlow";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ExportButton } from "@/components/accounting/ExportButton";
import { format } from "date-fns";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CashFlowStatement = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  
  const { data, isLoading, error } = useCashFlow(dateRange.from, dateRange.to);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-right">قائمة التدفقات النقدية</CardTitle>
          <CardDescription className="text-right">
            تحليل التدفقات النقدية للفترة المحددة
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            from={dateRange.from}
            to={dateRange.to}
            onFromChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
            onToChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
          />
          {data && <ExportButton data={data} filename="cash_flow_statement" />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10 text-red-500">
            <p>حدث خطأ أثناء تحميل البيانات</p>
          </div>
        ) : data ? (
          <div className="space-y-6" dir="rtl">
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">الفترة من</p>
                  <p className="font-medium">{data.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الفترة إلى</p>
                  <p className="font-medium">{data.endDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رصيد بداية الفترة</p>
                  <p className="font-medium">{formatCurrency(data.beginningBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رصيد نهاية الفترة</p>
                  <p className="font-medium">{formatCurrency(data.endingBalance)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">1. أنشطة التشغيل</h3>
              {data.operatingActivities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">البيان</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.operatingActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>{formatCurrency(activity.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">
                        صافي النقد من أنشطة التشغيل
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(data.totalOperating)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">لا توجد أنشطة تشغيل خلال الفترة المحددة</p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">2. أنشطة الاستثمار</h3>
              {data.investingActivities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">البيان</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.investingActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>{formatCurrency(activity.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">
                        صافي النقد من أنشطة الاستثمار
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(data.totalInvesting)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">لا توجد أنشطة استثمار خلال الفترة المحددة</p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">3. أنشطة التمويل</h3>
              {data.financingActivities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">البيان</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.financingActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>{formatCurrency(activity.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">
                        صافي النقد من أنشطة التمويل
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(data.totalFinancing)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">لا توجد أنشطة تمويل خلال الفترة المحددة</p>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">صافي التغير في النقد</h3>
                <p className={`text-lg font-bold ${data.netChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(data.netChange)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <p>لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
