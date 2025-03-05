
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TaskCompletionTimeChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export const TaskCompletionTimeChart = ({ data }: TaskCompletionTimeChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            formatter={(value) => [`${value} يوم`, 'متوسط الوقت للإنجاز']}
            labelFormatter={(name) => `الشهر: ${name}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="متوسط وقت الإنجاز (بالأيام)" 
            stroke="#8884d8" 
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
