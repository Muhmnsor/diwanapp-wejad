
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface UserProjectContributionsProps {
  data: Array<{
    projectName: string;
    count: number;
    completedCount: number;
  }>;
}

export const UserProjectContributions = ({ data }: UserProjectContributionsProps) => {
  const chartData = data
    .slice(0, 10) // Limit to top 10 projects to keep the chart readable
    .map(item => ({
      ...item,
      completionRate: item.count > 0 ? Math.round((item.completedCount / item.count) * 100) : 0
    }));
  
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="projectName" width={100} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'count') return [`${value} مهام`, 'إجمالي المهام'];
              if (name === 'completedCount') return [`${value} مهام`, 'المهام المكتملة'];
              if (name === 'completionRate') return [`${value}%`, 'نسبة الإكمال'];
              return [value, name];
            }}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'count') return 'إجمالي المهام';
              if (value === 'completedCount') return 'المهام المكتملة';
              if (value === 'completionRate') return 'نسبة الإكمال';
              return value;
            }}
          />
          <Bar dataKey="count" fill="#8884d8" name="count" />
          <Bar dataKey="completedCount" fill="#82ca9d" name="completedCount" />
          <Bar dataKey="completionRate" fill="#ffc658" name="completionRate">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                entry.completionRate > 75 ? '#10b981' : 
                entry.completionRate > 50 ? '#fbbf24' : 
                entry.completionRate > 25 ? '#f59e0b' : '#ef4444'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
