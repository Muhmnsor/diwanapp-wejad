
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { FileDown } from "lucide-react";

export const IncomeStatement = () => {
  const { accounts, isLoading, error } = useAccounts();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // تنظيم الحسابات حسب النوع
  const revenueAccounts = accounts?.filter(account => account.account_type === 'revenue') || [];
  const expenseAccounts = accounts?.filter(account => account.account_type === 'expense') || [];

  // حساب إجماليات كل قسم (في الواقع، هذه البيانات ستأتي من خدمة API تقوم بحساب الأرصدة)
  const totalRevenue = revenueAccounts.length ? 500000 : 0; // بيانات وهمية للعرض
  const totalExpenses = expenseAccounts.length ? 350000 : 0; // بيانات وهمية للعرض
  const netIncome = totalRevenue - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-right">قائمة الدخل</CardTitle>
          <CardDescription className="text-right">
            عرض الإيرادات والمصروفات للفترة من {startDate} إلى {endDate}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 border rounded-md"
            />
            <span>إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 border rounded-md"
            />
          </div>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* قسم الإيرادات */}
          <div>
            <h3 className="text-xl font-bold mb-3">الإيرادات</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="revenues">
                <AccordionTrigger className="text-lg font-semibold">
                  الإيرادات ({revenueAccounts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">الحساب</span>
                      <span className="font-medium text-left">المبلغ</span>
                    </div>
                    {revenueAccounts.map((account) => (
                      <div key={account.id} className="grid grid-cols-2 hover:bg-gray-50 rounded p-1">
                        <span>{account.name}</span>
                        <span className="text-left">{(Math.random() * 100000).toFixed(2)} ريال</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex justify-between py-2 mt-2 border-t font-bold">
              <span>إجمالي الإيرادات</span>
              <span>{totalRevenue.toLocaleString()} ريال</span>
            </div>
          </div>

          {/* قسم المصروفات */}
          <div>
            <h3 className="text-xl font-bold mb-3">المصروفات</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="expenses">
                <AccordionTrigger className="text-lg font-semibold">
                  المصروفات ({expenseAccounts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">الحساب</span>
                      <span className="font-medium text-left">المبلغ</span>
                    </div>
                    {expenseAccounts.map((account) => (
                      <div key={account.id} className="grid grid-cols-2 hover:bg-gray-50 rounded p-1">
                        <span>{account.name}</span>
                        <span className="text-left">{(Math.random() * 50000).toFixed(2)} ريال</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex justify-between py-2 mt-2 border-t font-bold">
              <span>إجمالي المصروفات</span>
              <span>{totalExpenses.toLocaleString()} ريال</span>
            </div>
          </div>

          {/* صافي الدخل */}
          <div className="py-4 mt-4 border-t-2 border-black">
            <div className="flex justify-between text-xl font-bold">
              <span>صافي الدخل</span>
              <span className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                {netIncome.toLocaleString()} ريال
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
