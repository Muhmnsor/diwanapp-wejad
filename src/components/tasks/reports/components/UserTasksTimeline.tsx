
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UserTasksTimelineProps {
  data: Array<{
    month: string;
    total: number;
    completed: number;
  }>;
}

export const UserTasksTimeline = ({ data }: UserTasksTimelineProps) => {
  // Reverse the data to show the oldest first
  const chartData = [...data].reverse();
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              return [value, name === 'completed' ? 'مكتملة' : 'إجمالي'];
            }}
            labelFormatter={(label) => `الشهر: ${label}`}
          />
          <Legend formatter={(value) => value === 'completed' ? 'مكتملة' : 'إجمالي'} />
          <Bar dataKey="total" fill="#8884d8" name="total" />
          <Bar dataKey="completed" fill="#82ca9d" name="completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
