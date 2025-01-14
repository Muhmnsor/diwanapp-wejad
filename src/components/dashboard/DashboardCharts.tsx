import { DashboardData } from "@/types/dashboard";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardChartsProps {
  data: DashboardData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const DashboardCharts = ({ data }: DashboardChartsProps) => {
  console.log('Chart data:', {
    tasksByStatus: data.tasksByStatus,
    tasksByPriority: data.tasksByPriority,
    tasksByPortfolio: data.tasksByPortfolio,
    tasksByMonth: data.tasksByMonth
  });
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">المهام حسب الحالة</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={data.tasksByStatus}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.tasksByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">المهام حسب الأولوية</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={data.tasksByPriority}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={80}
              fill="#82ca9d"
              dataKey="value"
            >
              {data.tasksByPriority.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">المهام الشهرية</h3>
        <BarChart
          width={800}
          height={300}
          data={data.tasksByMonth}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="عدد المهام" />
        </BarChart>
      </Card>
    </div>
  );
};