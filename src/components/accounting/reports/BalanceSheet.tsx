
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

export const BalanceSheet = () => {
  const { accounts, isLoading, error } = useAccounts();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // تنظيم الحسابات حسب النوع
  const assetAccounts = accounts?.filter(account => account.account_type === 'asset') || [];
  const liabilityAccounts = accounts?.filter(account => account.account_type === 'liability') || [];
  const equityAccounts = accounts?.filter(account => account.account_type === 'equity') || [];

  // حساب إجماليات كل قسم (في الواقع، هذه البيانات ستأتي من خدمة API تقوم بحساب الأرصدة)
  const totalAssets = assetAccounts.length ? 1000000 : 0; // بيانات وهمية للعرض
  const totalLiabilities = liabilityAccounts.length ? 650000 : 0; // بيانات وهمية للعرض
  const totalEquity = equityAccounts.length ? 350000 : 0; // بيانات وهمية للعرض

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
          <CardTitle className="text-right">الميزانية العمومية</CardTitle>
          <CardDescription className="text-right">
            عرض الأصول والالتزامات وحقوق الملكية كما في تاريخ {selectedDate}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border rounded-md"
          />
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* قسم الأصول */}
          <div>
            <h3 className="text-xl font-bold mb-3">الأصول</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="assets">
                <AccordionTrigger className="text-lg font-semibold">
                  الأصول ({assetAccounts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">الحساب</span>
                      <span className="font-medium text-left">الرصيد</span>
                    </div>
                    {assetAccounts.map((account) => (
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
              <span>إجمالي الأصول</span>
              <span>{totalAssets.toLocaleString()} ريال</span>
            </div>
          </div>

          {/* قسم الالتزامات */}
          <div>
            <h3 className="text-xl font-bold mb-3">الالتزامات</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="liabilities">
                <AccordionTrigger className="text-lg font-semibold">
                  الالتزامات ({liabilityAccounts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">الحساب</span>
                      <span className="font-medium text-left">الرصيد</span>
                    </div>
                    {liabilityAccounts.map((account) => (
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
              <span>إجمالي الالتزامات</span>
              <span>{totalLiabilities.toLocaleString()} ريال</span>
            </div>
          </div>

          {/* قسم حقوق الملكية */}
          <div>
            <h3 className="text-xl font-bold mb-3">حقوق الملكية</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="equity">
                <AccordionTrigger className="text-lg font-semibold">
                  حقوق الملكية ({equityAccounts.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="font-medium">الحساب</span>
                      <span className="font-medium text-left">الرصيد</span>
                    </div>
                    {equityAccounts.map((account) => (
                      <div key={account.id} className="grid grid-cols-2 hover:bg-gray-50 rounded p-1">
                        <span>{account.name}</span>
                        <span className="text-left">{(Math.random() * 70000).toFixed(2)} ريال</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex justify-between py-2 mt-2 border-t font-bold">
              <span>إجمالي حقوق الملكية</span>
              <span>{totalEquity.toLocaleString()} ريال</span>
            </div>
          </div>

          {/* الإجمالي */}
          <div className="py-4 mt-4 border-t-2 border-black">
            <div className="flex justify-between text-xl font-bold">
              <span>إجمالي الالتزامات وحقوق الملكية</span>
              <span>{(totalLiabilities + totalEquity).toLocaleString()} ريال</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
