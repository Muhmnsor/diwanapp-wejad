
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamProductivityChartProps {
  data: {
    name: string;
    days: number;
    expected: number;
  }[];
}

export const TeamProductivityChart = ({ data }: TeamProductivityChartProps) => {
  return (
    <div className="h-[300px] w-full">
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
            formatter={(value, name) => [
              `${value} يوم`, 
              name === 'days' ? 'الوقت المستغرق' : 'الوقت المتوقع'
            ]}
            labelFormatter={(name) => `المشروع: ${name}`}
          />
          <Bar dataKey="days" name="الوقت المستغرق (بالأيام)" fill="#3b82f6" />
          <Bar dataKey="expected" name="الوقت المتوقع (بالأيام)" fill="#9ca3af" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
