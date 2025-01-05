import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartData } from "@/types/dashboard";

interface MonthlyDistributionChartProps {
  data: ChartData[];
}

export const MonthlyDistributionChart = ({ data }: MonthlyDistributionChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع الأحداث على شهور السنة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="عدد الأحداث" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};