// src/components/accounting/charts/MonthlyComparisonChart.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMonthlyRevenueExpenses } from "@/hooks/accounting/useMonthlyRevenueExpenses";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const MonthlyComparisonChart: React.FC = () => {
  const { data, isLoading, error } = useMonthlyRevenueExpenses();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">مقارنة الإيرادات والمصروفات الشهرية</CardTitle>
          <CardDescription className="text-right">
            مقارنة الإيرادات والمصروفات على مدار 12 شهرًا
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">مقارنة الإيرادات والمصروفات الشهرية</CardTitle>
          <CardDescription className="text-right">
            حدث خطأ أثناء تحميل البيانات
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-destructive">
          {String(error)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">مقارنة الإيرادات والمصروفات الشهرية</CardTitle>
        <CardDescription className="text-right">
          مقارنة الإيرادات والمصروفات على مدار 12 شهرًا
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" angle={-45} textAnchor="end" height={50} />
            <YAxis tickFormatter={(value) => formatCurrency(value, 0)} />
            <Tooltip 
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => `الشهر: ${label}`}
            />
            <Legend 
              formatter={(value) => (value === 'revenue' ? 'الإيرادات' : 'المصروفات')}
            />
            <Bar dataKey="revenue" name="الإيرادات" fill="#8B5CF6" />
            <Bar dataKey="expenses" name="المصروفات" fill="#F97316" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

