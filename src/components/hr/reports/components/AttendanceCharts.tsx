
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAttendanceReport, AttendanceReportData } from "@/hooks/hr/useAttendanceReport";
import { EmptyState } from "@/components/ui/empty-state";
import { Loader2, BarChart2, PieChart as PieChartIcon } from "lucide-react";

interface AttendanceChartsProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

export function AttendanceCharts({ startDate, endDate, employeeId }: AttendanceChartsProps) {
  const { data, isLoading, error } = useAttendanceReport(startDate, endDate, employeeId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <EmptyState
            icon={<BarChart2 className="h-8 w-8 text-muted-foreground" />}
            title="تعذر تحميل البيانات"
            description="حدث خطأ أثناء جلب بيانات الحضور"
          />
        </CardContent>
      </Card>
    );
  }

  // إعداد بيانات الرسم البياني للحالات (حاضر، غائب، متأخر، إجازة)
  const statusData = [
    { name: "حضور", value: data.stats.presentCount, color: '#22c55e' },
    { name: "غياب", value: data.stats.absentCount, color: '#ef4444' },
    { name: "تأخير", value: data.stats.lateCount, color: '#f59e0b' },
    { name: "إجازة", value: data.stats.leaveCount, color: '#3b82f6' }
  ];

  // إعداد بيانات الرسم البياني للجداول (إذا كانت متوفرة)
  const scheduleData = data.stats.byScheduleType ? 
    data.stats.byScheduleType.map(schedule => ({
      name: schedule.name,
      حضور: schedule.present,
      غياب: schedule.absent,
      تأخير: schedule.late,
      إجازة: schedule.leave
    })) : [];

  // إعداد بيانات الرسم البياني للموظفين (إذا كانت متوفرة)
  const employeeData = data.employeeStats ? 
    data.employeeStats.map(emp => ({
      name: emp.employee_name,
      حضور: emp.present,
      غياب: emp.absent,
      تأخير: emp.late,
      إجازة: emp.leave
    })) : [];

  // تصفية البيانات للرسوم البيانية (إزالة القيم الصفرية)
  const filteredStatusData = statusData.filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* الرسم البياني الدائري للحضور/الغياب */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">توزيع الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {filteredStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, 'العدد']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<PieChartIcon className="h-8 w-8 text-muted-foreground" />}
              title="لا توجد بيانات"
              description="لا توجد بيانات حضور في الفترة المحددة"
            />
          )}
        </CardContent>
      </Card>

      {/* الرسم البياني الشريطي للجداول */}
      {scheduleData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">الحضور حسب الجدول</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scheduleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="حضور" fill="#22c55e" />
                <Bar dataKey="غياب" fill="#ef4444" />
                <Bar dataKey="تأخير" fill="#f59e0b" />
                <Bar dataKey="إجازة" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* الرسم البياني الشريطي للموظفين (يظهر فقط إذا كان هناك أكثر من موظف) */}
      {employeeData.length > 1 && !employeeId && (
        <Card className={scheduleData.length > 0 ? "lg:col-span-2" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">الحضور حسب الموظف</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="حضور" fill="#22c55e" />
                <Bar dataKey="غياب" fill="#ef4444" />
                <Bar dataKey="تأخير" fill="#f59e0b" />
                <Bar dataKey="إجازة" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
