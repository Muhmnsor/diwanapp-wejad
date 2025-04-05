
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBalanceSheet } from "@/hooks/accounting/useBalanceSheet";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export const BalanceSheet = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data, isLoading, error } = useBalanceSheet(selectedDate);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

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
          <CardTitle className="text-right">الميزانية العمومية</CardTitle>
          <CardDescription className="text-right">جاري تحميل البيانات...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">الميزانية العمومية</CardTitle>
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
          <CardTitle className="text-right">الميزانية العمومية</CardTitle>
          <CardDescription className="text-right">
            بتاريخ {format(selectedDate, 'PPP', { locale: ar })}
          </CardDescription>
        </div>
        
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>اختيار التاريخ</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Assets Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-right">الأصول</h3>
            <div className="space-y-6">
              {/* Current Assets */}
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-right p-2 border-b">الحساب</th>
                      <th className="text-left p-2 border-b">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.assets.map(account => (
                      <tr key={account.id} className="border-b">
                        <td className="p-2 pr-4">
                          {account.code} - {account.name}
                        </td>
                        <td className="p-2 text-left">
                          {formatCurrency(account.balance)}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-muted">
                      <td className="p-2 pr-4 font-bold">إجمالي الأصول</td>
                      <td className="p-2 text-left font-bold">
                        {formatCurrency(data?.totalAssets || 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Liabilities and Equity Column */}
          <div>
            <div className="space-y-6">
              {/* Liabilities */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-right">الالتزامات</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-right p-2 border-b">الحساب</th>
                        <th className="text-left p-2 border-b">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.liabilities.map(account => (
                        <tr key={account.id} className="border-b">
                          <td className="p-2 pr-4">
                            {account.code} - {account.name}
                          </td>
                          <td className="p-2 text-left">
                            {formatCurrency(account.balance)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-muted">
                        <td className="p-2 pr-4 font-bold">إجمالي الالتزامات</td>
                        <td className="p-2 text-left font-bold">
                          {formatCurrency(data?.totalLiabilities || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Equity */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-right">حقوق الملكية</h3>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-right p-2 border-b">الحساب</th>
                        <th className="text-left p-2 border-b">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.equity.map(account => (
                        <tr key={account.id} className="border-b">
                          <td className="p-2 pr-4">
                            {account.code} - {account.name}
                          </td>
                          <td className="p-2 text-left">
                            {formatCurrency(account.balance)}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-muted">
                        <td className="p-2 pr-4 font-bold">إجمالي حقوق الملكية</td>
                        <td className="p-2 text-left font-bold">
                          {formatCurrency(data?.totalEquity || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Total Liabilities and Equity */}
              <div className="rounded-md border bg-muted">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="p-3 pr-4 font-bold text-lg">إجمالي الالتزامات وحقوق الملكية</td>
                      <td className="p-3 text-left font-bold text-lg">
                        {formatCurrency((data?.totalLiabilities || 0) + (data?.totalEquity || 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
