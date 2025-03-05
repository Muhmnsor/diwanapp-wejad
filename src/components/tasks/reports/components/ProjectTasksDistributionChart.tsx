
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectTasksDistributionChartProps {
  data: {
    name: string;
    completed: number;
    pending: number;
    overdue: number;
  }[];
}

export const ProjectTasksDistributionChart = ({ data }: ProjectTasksDistributionChartProps) => {
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
              name === 'completed' ? 'المهام المكتملة' : 
              name === 'pending' ? 'المهام المعلقة' : 'المهام المتأخرة'
            ]}
            labelFormatter={(name) => `المشروع: ${name}`}
          />
          <Bar dataKey="completed" name="المهام المكتملة" stackId="a" fill="#10b981" />
          <Bar dataKey="pending" name="المهام المعلقة" stackId="a" fill="#3b82f6" />
          <Bar dataKey="overdue" name="المهام المتأخرة" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
