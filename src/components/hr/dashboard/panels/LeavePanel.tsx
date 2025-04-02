
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { useLeaveReport } from "@/hooks/hr/useLeaveReport";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { CalendarDays, Loader } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LeavePanelProps {
  department?: string;
  dateRange: DateRange | null;
}

export function LeavePanel({ department, dateRange }: LeavePanelProps) {
  // Set default dates if not provided
  const startDate = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 3));
  const endDate = dateRange?.to || new Date();
  
  // Use the leave report hook
  const { data, isLoading, error } = useLeaveReport(startDate, endDate);
  
  // Prepare leave type distribution data
  const leaveTypeData = {
    labels: data?.leaveTypeStats?.map(stat => stat.leave_type) || [],
    datasets: [
      {
        data: data?.leaveTypeStats?.map(stat => stat.count) || [],
        backgroundColor: [
          "#4ade80", // سنوية
          "#f97316", // مرضية
          "#8b5cf6", // طارئة
          "#0ea5e9", // أسرية
          "#d946ef", // دراسية
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Random data for heat map (in a real app, this would come from actual data)
  const generateMonthlyData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return {
      labels: months,
      datasets: [
        {
          label: 'طلبات الإجازات',
          data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20)),
          backgroundColor: '#8b5cf6',
        },
      ],
    };
  };
  
  const monthlyLeaveData = generateMonthlyData();
  
  // Upcoming leaves (in a real app, this would come from actual data)
  const upcomingLeaves = [
    { name: "محمد أحمد", type: "سنوية", startDate: "15/06/2023", days: 5 },
    { name: "سارة خالد", type: "مرضية", startDate: "18/06/2023", days: 2 },
    { name: "أحمد علي", type: "طارئة", startDate: "20/06/2023", days: 1 },
    { name: "فاطمة محمد", type: "سنوية", startDate: "22/06/2023", days: 7 },
    { name: "خالد عمر", type: "أسرية", startDate: "25/06/2023", days: 3 },
  ];

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
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex justify-center">
            <Doughnut 
              data={leaveTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-green-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">الموافقة</div>
              <div className="text-lg font-bold text-green-600">
                {data?.stats.approvedPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">الرفض</div>
              <div className="text-lg font-bold text-red-600">
                {data?.stats.rejectedPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">قيد الانتظار</div>
              <div className="text-lg font-bold text-gray-600">
                {data?.stats.pendingPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">إجمالي الأيام</div>
              <div className="text-lg font-bold text-blue-600">
                {data?.stats.totalDays || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات خلال العام</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar 
            data={monthlyLeaveData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
            height={250}
          />
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الإجازات المجدولة للأسبوعين القادمين</CardTitle>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 font-medium">الموظف</th>
                  <th className="text-right py-3 font-medium">نوع الإجازة</th>
                  <th className="text-right py-3 font-medium">تاريخ البدء</th>
                  <th className="text-right py-3 font-medium">عدد الأيام</th>
                </tr>
              </thead>
              <tbody>
                {upcomingLeaves.map((leave, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{leave.name}</td>
                    <td className="py-2">{leave.type}</td>
                    <td className="py-2" dir="ltr">{leave.startDate}</td>
                    <td className="py-2">{leave.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
