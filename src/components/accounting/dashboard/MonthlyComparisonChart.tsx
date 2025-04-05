
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonthlyFinancials } from "@/hooks/accounting/useMonthlyFinancials";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const MonthlyComparisonChart = () => {
  const { monthlyData, isLoading, error } = useMonthlyFinancials();

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-right">المقارنة الشهرية للإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center py-10">جاري تحميل البيانات...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-right">المقارنة الشهرية للإيرادات والمصروفات</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center py-10 text-red-500">حدث خطأ أثناء تحميل البيانات</div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-md shadow-md">
          <p className="font-bold text-right">{label}</p>
          <p className="text-right text-green-500">
            الإيرادات: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-right text-red-500">
            المصروفات: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-right font-semibold border-t mt-2 pt-2">
            صافي: {formatCurrency(payload[0].value - payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-right">المقارنة الشهرية للإيرادات والمصروفات</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45} 
              textAnchor="end"
              tick={{ fontSize: 12 }}
              height={60}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              width={100}
              mirror={true}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              formatter={(value) => value === 'revenue' ? 'الإيرادات' : 'المصروفات'} 
              align="right"
            />
            <Bar 
              dataKey="revenue" 
              name="revenue" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="expense" 
              name="expense" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
