import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardData } from "@/types/dashboard";

interface DashboardChartsProps {
  data: DashboardData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export const DashboardCharts = ({ data }: DashboardChartsProps) => {
  console.log('Raw Chart data:', data);
  
  // Transform and validate eventsByType data
  const eventsByType = data.eventsByType.map(item => ({
    name: item.name,
    value: Number(item.value) || 0  // Ensure value is a number
  }));

  // Transform and validate eventsByBeneficiary data
  const eventsByBeneficiary = data.eventsByBeneficiary.map(item => ({
    name: item.name,
    value: Number(item.value) || 0  // Ensure value is a number
  }));

  console.log('Processed Chart data:', {
    eventsByType,
    eventsByBeneficiary
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>توزيع الفعاليات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value).toFixed(0), 'عدد الفعاليات']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الفعاليات حسب المسار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventsByBeneficiary}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {eventsByBeneficiary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value).toFixed(0), 'عدد الفعاليات']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};