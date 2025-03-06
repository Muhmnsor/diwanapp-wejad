
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface UserTasksDistributionProps {
  data: Array<{
    priority: string;
    count: number;
  }>;
}

export const UserTasksDistribution = ({ data }: UserTasksDistributionProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="priority"
            label={({ priority, count, percent }) => `${priority}: ${count} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value} مهمة`, props.payload.priority]} />
          <Legend formatter={(value, entry) => entry.payload.priority} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
