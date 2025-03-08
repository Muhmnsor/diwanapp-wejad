
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DelayTimeChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export const DelayTimeChart = ({ data }: DelayTimeChartProps) => {
  return (
    <div className="h-[300px] w-full" id="delay-time-chart" data-title="متوسط وقت التأخير">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
            formatter={(value) => [`${value} يوم`, 'متوسط وقت التأخير']}
            labelFormatter={(name) => `الشهر: ${name}`}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            name="متوسط وقت التأخير (بالأيام)" 
            stroke="#f59e0b" 
            fill="#fef3c7" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
