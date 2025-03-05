
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectCompletionRateChartProps {
  data: {
    name: string;
    rate: number;
  }[];
}

export const ProjectCompletionRateChart = ({ data }: ProjectCompletionRateChartProps) => {
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
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'نسبة الإنجاز']}
            labelFormatter={(name) => `المشروع: ${name}`}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            name="نسبة الإنجاز" 
            stroke="#3b82f6" 
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
