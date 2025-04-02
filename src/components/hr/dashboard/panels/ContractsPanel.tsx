
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatDate } from "@/utils/dateUtils";
import { FileText, Loader } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface ContractsPanelProps {
  department?: string;
  dateRange: DateRange | null;
}

export function ContractsPanel({ department, dateRange }: ContractsPanelProps) {
  // Use the employee contracts hook
  const { expiringContracts, endingProbations, isLoading, error } = useEmployeeContracts();
  
  // Random data for employee movement chart (in a real app, this would come from actual data)
  const generateEmployeeMovementData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return {
      labels: months,
      datasets: [
        {
          label: 'موظفين جدد',
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 5) + 1),
          backgroundColor: '#4ade80',
        },
        {
          label: 'انتهاء خدمة',
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 3)),
          backgroundColor: '#f43f5e',
        },
      ],
    };
  };
  
  const employeeMovementData = generateEmployeeMovementData();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ في تحميل البيانات
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>حركة الموظفين خلال العام</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar 
            data={employeeMovementData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
              },
            }}
            height={100}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>العقود التي ستنتهي قريبًا</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 font-medium">الموظف</th>
                  <th className="text-right py-2 font-medium">القسم</th>
                  <th className="text-right py-2 font-medium">تاريخ الانتهاء</th>
                  <th className="text-right py-2 font-medium">الأيام المتبقية</th>
                </tr>
              </thead>
              <tbody>
                {expiringContracts?.map((contract, index) => {
                  const endDate = new Date(contract.end_date);
                  const today = new Date();
                  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{contract.employees?.full_name}</td>
                      <td className="py-2">{contract.employees?.department || 'غير محدد'}</td>
                      <td className="py-2" dir="ltr">{formatDate(contract.end_date)}</td>
                      <td className={`py-2 ${daysRemaining <= 7 ? 'text-red-500 font-bold' : daysRemaining <= 14 ? 'text-orange-500' : ''}`}>
                        {daysRemaining}
                      </td>
                    </tr>
                  );
                })}
                {expiringContracts?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      لا توجد عقود ستنتهي قريبًا
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>فترات التجربة المنتهية قريبًا</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 font-medium">الموظف</th>
                  <th className="text-right py-2 font-medium">المنصب</th>
                  <th className="text-right py-2 font-medium">تاريخ الانتهاء</th>
                  <th className="text-right py-2 font-medium">الأيام المتبقية</th>
                </tr>
              </thead>
              <tbody>
                {endingProbations?.map((probation, index) => {
                  const endDate = new Date(probation.probation_end_date);
                  const today = new Date();
                  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{probation.employees?.full_name}</td>
                      <td className="py-2">{probation.employees?.position || 'غير محدد'}</td>
                      <td className="py-2" dir="ltr">{formatDate(probation.probation_end_date)}</td>
                      <td className={`py-2 ${daysRemaining <= 3 ? 'text-red-500 font-bold' : daysRemaining <= 7 ? 'text-orange-500' : ''}`}>
                        {daysRemaining}
                      </td>
                    </tr>
                  );
                })}
                {endingProbations?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      لا توجد فترات تجربة ستنتهي قريبًا
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
