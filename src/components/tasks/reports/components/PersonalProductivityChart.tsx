
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PersonalProductivityChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export const PersonalProductivityChart = ({ data }: PersonalProductivityChartProps) => {
  return (
    <div className="h-[300px] w-full" id="productivity-chart" data-title="إنتاجية العمل الشهرية">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => [value, 'عدد المهام المنجزة']}
            labelFormatter={(name) => `الشهر: ${name}`}
          />
          <Bar dataKey="value" name="المهام المنجزة" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
