import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/accounting/ErrorBoundary";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";

// This is a placeholder component - will be expanded with real data
export const CashFlowStatement = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder data for cash flow statement
  const cashFlowData = {
    operatingActivities: [
      { name: "الربح الصافي", amount: 25000 },
      { name: "الاستهلاك", amount: 5000 },
      { name: "التغير في الذمم المدينة", amount: -3000 },
      { name: "التغير في المخزون", amount: -2000 },
      { name: "التغير في الذمم الدائنة", amount: 1500 },
    ],
    investingActivities: [
      { name: "شراء معدات", amount: -15000 },
      { name: "بيع أصول", amount: 3000 },
    ],
    financingActivities: [
      { name: "توزيعات أرباح", amount: -5000 },
      { name: "إصدار أسهم", amount: 10000 },
    ],
  };

  const operatingTotal = cashFlowData.operatingActivities.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  
  const investingTotal = cashFlowData.investingActivities.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  
  const financingTotal = cashFlowData.financingActivities.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  
  const netCashFlow = operatingTotal + investingTotal + financingTotal;

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-right">قائمة التدفقات النقدية</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>اختر تاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة التشغيلية</h3>
                <div className="space-y-1">
                  {cashFlowData.operatingActivities.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className={item.amount < 0 ? "text-red-600" : ""}>
                        {formatCurrency(item.amount)}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(operatingTotal)}</span>
                    <span>إجمالي الأنشطة التشغيلية</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة الاستثمارية</h3>
                <div className="space-y-1">
                  {cashFlowData.investingActivities.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className={item.amount < 0 ? "text-red-600" : ""}>
                        {formatCurrency(item.amount)}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(investingTotal)}</span>
                    <span>إجمالي الأنشطة الاستثمارية</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة التمويلية</h3>
                <div className="space-y-1">
                  {cashFlowData.financingActivities.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className={item.amount < 0 ? "text-red-600" : ""}>
                        {formatCurrency(item.amount)}
                      </span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(financingTotal)}</span>
                    <span>إجمالي الأنشطة التمويلية</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span className={netCashFlow < 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(netCashFlow)}
                </span>
                <span>صافي التغير في النقد</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
