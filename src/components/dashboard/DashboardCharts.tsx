import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardData } from "@/types/dashboard";

interface DashboardChartsProps {
  data: DashboardData;
}

export const DashboardCharts = ({ data }: DashboardChartsProps) => {
  console.log('Original beneficiary data:', data.eventsByBeneficiary);
  
  // Transform beneficiary data to Arabic labels and ensure all three types exist
  const transformedBeneficiaryData = [
    {
      name: 'رجال',
      value: data.eventsByBeneficiary.find(item => item.name === 'men')?.value || 0
    },
    {
      name: 'نساء',
      value: data.eventsByBeneficiary.find(item => item.name === 'women')?.value || 0
    },
    {
      name: 'رجال ونساء',
      value: data.eventsByBeneficiary.find(item => item.name === 'both')?.value || 0
    }
  ];

  console.log('Final transformed beneficiary data:', transformedBeneficiaryData);

  // Transform event types to Arabic
  const transformedEventTypes = data.eventsByType.map(item => ({
    name: item.name === 'online' ? 'عن بعد' : 'حضوري',
    value: item.value
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>توزيع الفعاليات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedEventTypes}>
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
          <CardTitle>توزيع الفعاليات حسب المستفيدين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transformedBeneficiaryData}>
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