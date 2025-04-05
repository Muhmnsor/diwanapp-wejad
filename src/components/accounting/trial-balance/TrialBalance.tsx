
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrialBalance } from "@/hooks/accounting/useTrialBalance";
import { ExportButton } from "@/components/accounting/ExportButton";
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
import { TrialBalanceTable } from "./TrialBalanceTable";

export const TrialBalance = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  const { data: trialBalanceData, isLoading, error } = useTrialBalance(date);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-right">ميزان المراجعة</CardTitle>
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
          {trialBalanceData && <ExportButton data={trialBalanceData} filename="trial_balance" />}
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
        ) : trialBalanceData ? (
          <>
            <TrialBalanceTable data={trialBalanceData} />
            <div className="mt-4 text-left">
              <div className="flex justify-end items-center gap-2">
                <div className={`text-sm ${trialBalanceData.isBalanced ? 'text-green-500' : 'text-red-500'}`}>
                  {trialBalanceData.isBalanced ? 
                    'ميزان المراجعة متوازن' : 
                    'تنبيه: ميزان المراجعة غير متوازن'}
                </div>
                {trialBalanceData.isBalanced && (
                  <div className="bg-green-100 text-green-700 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center py-10">
            <p>لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
