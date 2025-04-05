
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useTrialBalance } from "@/hooks/accounting/useTrialBalance";
import { TrialBalanceTable } from "./TrialBalanceTable";
import { ExportButton } from "@/components/accounting/ExportButton";

export const TrialBalance = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  const { data, isLoading, error } = useTrialBalance(date);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-right">ميزان المراجعة</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker 
            from={date}
            to={date}
            onFromChange={(date) => setDate(date)}
            onToChange={() => {}}
          />
          {data && <ExportButton data={data.entries} filename="trial_balance" />}
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
        ) : data && data.entries.length > 0 ? (
          <TrialBalanceTable data={data} />
        ) : (
          <div className="flex justify-center items-center py-10">
            <p>لا توجد بيانات متاحة</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
