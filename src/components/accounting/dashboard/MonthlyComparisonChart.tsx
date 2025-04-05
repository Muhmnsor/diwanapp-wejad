
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMonthlyComparison } from "@/hooks/accounting/useMonthlyComparison";
import { formatCurrency } from "@/lib/utils";

export const MonthlyComparisonChart = () => {
  const { monthlyData, isLoading, error } = useMonthlyComparison();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">مقارنة شهرية للإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center">جاري تحميل البيانات...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">مقارنة شهرية للإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-destructive">حدث خطأ أثناء تحميل البيانات</div>
        </CardContent>
      </Card>
    );
  }

  const legendFormatter = (value: string) => {
    return value === 'expenses' ? 'المصروفات' : 'الإيرادات';
  };
  
  const tooltipFormatter = (value: number) => {
    return formatCurrency(value);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">مقارنة شهرية للإيرادات والمصروفات</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 40,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              tick={{fontSize: 12}}
            />
            <YAxis 
              tickFormatter={tooltipFormatter}
              width={80}
            />
            <Tooltip formatter={tooltipFormatter} />
            <Legend
              formatter={legendFormatter}
              wrapperStyle={{ paddingTop: 10 }}
            />
            <Bar name="الإيرادات" dataKey="revenues" fill="#4ade80" radius={[4, 4, 0, 0]} />
            <Bar name="المصروفات" dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
