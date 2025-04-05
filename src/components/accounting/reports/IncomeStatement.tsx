
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIncomeStatement } from "@/hooks/accounting/useIncomeStatement";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subMonths } from "date-fns";
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export const IncomeStatement = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1), // Default to one month ago
    to: new Date(),
  });
  
  const { data, isLoading, error } = useIncomeStatement(
    date?.from || subMonths(new Date(), 1),
    date?.to || new Date()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة الدخل</CardTitle>
          <CardDescription className="text-right">جاري تحميل البيانات...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة الدخل</CardTitle>
          <CardDescription className="text-right text-red-500">
            حدث خطأ أثناء تحميل البيانات
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="outline" size="sm">
            <FileDown className="ml-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>
        
        <div>
          <CardTitle className="text-right">قائمة الدخل</CardTitle>
          <CardDescription className="text-right">
            للفترة من {date?.from ? format(date.from, 'PPP', { locale: ar }) : ''} 
            إلى {date?.to ? format(date.to, 'PPP', { locale: ar }) : ''}
          </CardDescription>
        </div>
        
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>تحديد الفترة</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-8">
          {/* Revenues */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-right">الإيرادات</h3>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-right p-2 border-b">الحساب</th>
                    <th className="text-left p-2 border-b">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.revenues && data.revenues.length > 0 ? (
                    data.revenues.map(account => (
                      <tr key={account.id} className="border-b">
                        <td className="p-2 pr-4">
                          {account.code} - {account.name}
                        </td>
                        <td className="p-2 text-left">
                          {formatCurrency(account.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-muted-foreground">
                        لا توجد إيرادات في هذه الفترة
                      </td>
                    </tr>
                  )}
                  
                  {/* Total Revenues */}
                  <tr className="bg-muted">
                    <td className="p-2 pr-4 font-bold">إجمالي الإيرادات</td>
                    <td className="p-2 text-left font-bold">
                      {formatCurrency(data?.totalRevenues || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Expenses */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-right">المصروفات</h3>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-right p-2 border-b">الحساب</th>
                    <th className="text-left p-2 border-b">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.expenses && data.expenses.length > 0 ? (
                    data.expenses.map(account => (
                      <tr key={account.id} className="border-b">
                        <td className="p-2 pr-4">
                          {account.code} - {account.name}
                        </td>
                        <td className="p-2 text-left">
                          {formatCurrency(account.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-muted-foreground">
                        لا توجد مصروفات في هذه الفترة
                      </td>
                    </tr>
                  )}
                  
                  {/* Total Expenses */}
                  <tr className="bg-muted">
                    <td className="p-2 pr-4 font-bold">إجمالي المصروفات</td>
                    <td className="p-2 text-left font-bold">
                      {formatCurrency(data?.totalExpenses || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Net Income */}
          <div className="rounded-md border bg-muted">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="p-3 pr-4 font-bold text-lg">
                    {data?.netIncome && data.netIncome >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                  </td>
                  <td className="p-3 text-left font-bold text-lg">
                    <span className={data?.netIncome && data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(data?.netIncome || 0)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
