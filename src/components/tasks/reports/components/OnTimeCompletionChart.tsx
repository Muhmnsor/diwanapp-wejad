
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OnTimeCompletionChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const OnTimeCompletionChart = ({ data }: OnTimeCompletionChartProps) => {
  return (
    <div className="h-[300px] w-full" dir="rtl">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value, 'عدد المهام']} 
            labelFormatter={(name) => `${name}`}
          />
          <Legend verticalAlign="bottom" layout="horizontal" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

