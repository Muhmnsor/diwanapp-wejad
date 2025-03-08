
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TopPerformer } from '../hooks/useTopPerformers';

interface TopPerformersChartProps {
  data: TopPerformer[];
  metricKey: 'completedTasks' | 'completionRate' | 'onTimeRate' | 'averageCompletionTime';
  metricLabel: string;
  color?: string;
}

export const TopPerformersChart = ({ 
  data, 
  metricKey, 
  metricLabel,
  color = "#3b82f6" 
}: TopPerformersChartProps) => {
  // Format data for the chart
  const chartData = data.map(performer => ({
    name: performer.name,
    value: performer.stats[metricKey]
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="h-[300px] w-full" id="top-performers-chart" data-title={`أفضل المستخدمين - ${metricLabel}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip
            formatter={(value) => [value, metricLabel]}
            labelFormatter={(name) => `المستخدم: ${name}`}
          />
          <Bar 
            dataKey="value" 
            name={metricLabel} 
            fill={color} 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
