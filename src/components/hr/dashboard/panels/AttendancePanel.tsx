
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Loader } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AttendancePanelProps {
  department?: string;
  dateRange: DateRange | null;
}

export function AttendancePanel({ department, dateRange }: AttendancePanelProps) {
  // Set default dates if not provided
  const startDate = dateRange?.from || new Date(new Date().setDate(1));
  const endDate = dateRange?.to || new Date();
  
  // Use the attendance report hook
  const { data, isLoading, error } = useAttendanceReport(startDate, endDate);
  
  // Calculate days of the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };
  
  const days = getDaysInMonth(new Date());
  
  // Random attendance data for the bar chart (in a real app, this would come from actual data)
  const generateDailyAttendance = () => {
    return days.map(() => Math.floor(Math.random() * 10) + 85);
  };
  
  const dailyAttendanceData = {
    labels: days.map(day => `${day}`),
    datasets: [
      {
        label: "نسبة الحضور",
        data: generateDailyAttendance(),
        backgroundColor: "#8b5cf6",
      },
    ],
  };
  
  const statusDistributionData = {
    labels: ["حاضر", "غائب", "متأخر", "في إجازة"],
    datasets: [
      {
        data: [
          data?.stats.presentCount || 0,
          data?.stats.absentCount || 0,
          data?.stats.lateCount || 0,
          data?.stats.leaveCount || 0,
        ],
        backgroundColor: [
          "#4ade80", // حاضر
          "#f43f5e", // غائب
          "#f97316", // متأخر
          "#8b5cf6", // في إجازة
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // List of employees with most tardiness
  const tardinessEmployees = [
    { name: "أحمد محمد", minutes: 120, days: 5 },
    { name: "سارة أحمد", minutes: 95, days: 3 },
    { name: "محمد خالد", minutes: 80, days: 4 },
    { name: "فاطمة علي", minutes: 65, days: 2 },
    { name: "خالد عمر", minutes: 45, days: 3 },
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
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>نسب الحضور اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar 
            data={dailyAttendanceData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                },
              },
            }}
            height={100}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>توزيع حالات الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex justify-center">
            <Pie 
              data={statusDistributionData}
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
          {/* إحصائيات الحضور */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-green-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">الحضور</div>
              <div className="text-lg font-bold text-green-600">
                {data?.stats.presentPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">الغياب</div>
              <div className="text-lg font-bold text-red-600">
                {data?.stats.absentPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">التأخير</div>
              <div className="text-lg font-bold text-orange-600">
                {data?.stats.latePercentage.toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-50 p-2 rounded-md text-center">
              <div className="text-sm text-gray-500">الإجازات</div>
              <div className="text-lg font-bold text-purple-600">
                {data?.stats.leavePercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>الموظفون الأكثر تأخرًا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 font-medium">الموظف</th>
                  <th className="text-right py-3 font-medium">دقائق التأخير</th>
                  <th className="text-right py-3 font-medium">عدد الأيام</th>
                </tr>
              </thead>
              <tbody>
                {tardinessEmployees.map((employee, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{employee.name}</td>
                    <td className="py-2">{employee.minutes}</td>
                    <td className="py-2">{employee.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            إجمالي دقائق التأخير: 405 دقيقة
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
