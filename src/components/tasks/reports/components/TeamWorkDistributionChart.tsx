
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamWorkDistributionChartProps {
  data: {
    name: string;
    assigned: number;
    completed: number;
  }[];
}

export const TeamWorkDistributionChart = ({ data }: TeamWorkDistributionChartProps) => {
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
              value, 
              name === 'assigned' ? 'المهام المسندة' : 'المهام المكتملة'
            ]}
            labelFormatter={(name) => `العضو: ${name}`}
          />
          <Bar dataKey="assigned" name="المهام المسندة" fill="#60a5fa" />
          <Bar dataKey="completed" name="المهام المكتملة" fill="#34d399" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
