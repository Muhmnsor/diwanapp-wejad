import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from "@/types/dashboard";

interface DashboardChartsProps {
  data: DashboardData;
}

export const DashboardCharts = ({ data }: DashboardChartsProps) => {
  console.log('Original path data:', data.eventsByBeneficiary);
  
  // Transform path data to Arabic labels
  const transformedPathData = [
    {
      name: 'بيئات',
      value: data.eventsByBeneficiary.find(item => item.name === 'environment')?.value || 0
    },
    {
      name: 'مجتمعات',
      value: data.eventsByBeneficiary.find(item => item.name === 'community')?.value || 0
    },
    {
      name: 'محتويات',
      value: data.eventsByBeneficiary.find(item => item.name === 'content')?.value || 0
    }
  ];

  console.log('Final transformed path data:', transformedPathData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>توزيع الفعاليات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
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
              <BarChart data={transformedPathData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};