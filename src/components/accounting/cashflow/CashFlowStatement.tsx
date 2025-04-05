import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, subMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/accounting/ErrorBoundary";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";
import { useCashFlow } from "@/hooks/accounting/useCashFlow";
import { DateRange } from "react-day-picker";

export const CashFlowStatement = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const { data, isLoading, error } = useCashFlow(
    dateRange?.from || subMonths(new Date(), 1),
    dateRange?.to || new Date()
  );

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
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy-MM-dd")} إلى{" "}
                        {format(dateRange.to, "yyyy-MM-dd")}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy-MM-dd")
                    )
                  ) : (
                    <span>اختر فترة</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
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
          ) : error ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-red-500">حدث خطأ أثناء تحميل البيانات</p>
            </div>
          ) : !data ? (
            <div className="flex justify-center items-center py-10">
              <p>لا توجد بيانات متاحة</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة التشغيلية</h3>
                <div className="space-y-1">
                  {data.operatingActivities.length > 0 ? (
                    data.operatingActivities.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {formatCurrency(item.amount)}
                        </span>
                        <span>{item.description}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      لا توجد أنشطة تشغيلية خلال هذه الفترة
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(data.totalOperating)}</span>
                    <span>إجمالي الأنشطة التشغيلية</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة الاستثمارية</h3>
                <div className="space-y-1">
                  {data.investingActivities.length > 0 ? (
                    data.investingActivities.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {formatCurrency(item.amount)}
                        </span>
                        <span>{item.description}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      لا توجد أنشطة استثمارية خلال هذه الفترة
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(data.totalInvesting)}</span>
                    <span>إجمالي الأنشطة الاستثمارية</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">الأنشطة التمويلية</h3>
                <div className="space-y-1">
                  {data.financingActivities.length > 0 ? (
                    data.financingActivities.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {formatCurrency(item.amount)}
                        </span>
                        <span>{item.description}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground">
                      لا توجد أنشطة تمويلية خلال هذه الفترة
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-1 mt-1">
                    <span>{formatCurrency(data.totalFinancing)}</span>
                    <span>إجمالي الأنشطة التمويلية</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span className={data.netChange < 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(data.netChange)}
                </span>
                <span>صافي التغير في النقد</span>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>{formatCurrency(data.beginningBalance)}</span>
                  <span>الرصيد في بداية الفترة</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{formatCurrency(data.endingBalance)}</span>
                  <span>الرصيد في نهاية الفترة</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
