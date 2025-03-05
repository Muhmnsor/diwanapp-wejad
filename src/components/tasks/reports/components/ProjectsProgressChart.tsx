
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectsProgressChartProps {
  data: {
    name: string;
    progress: number;
  }[];
}

export const ProjectsProgressChart = ({ data }: ProjectsProgressChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 100,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" />
          <Tooltip
            formatter={(value) => [`${value}%`, 'نسبة الإنجاز']}
            labelFormatter={(name) => `المشروع: ${name}`}
          />
          <Bar 
            dataKey="progress" 
            name="نسبة الإنجاز" 
            fill="#3b82f6" 
            background={{ fill: '#eee' }} 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
