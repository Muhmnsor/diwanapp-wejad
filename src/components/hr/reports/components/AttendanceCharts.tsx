
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart2, PieChart as PieChartIcon } from "lucide-react";

interface AttendanceChartsProps {
  startDate?: Date;
  endDate?: Date; 
  employeeId?: string;
}

export function AttendanceCharts({ startDate, endDate, employeeId }: AttendanceChartsProps) {
  const { data, isLoading, error } = useAttendanceReport(startDate, endDate, employeeId);
  
  const statusColors = {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
    leave: "#6366f1"
  };
  
  const statusData = useMemo(() => {
    if (!data) return [];
    
    return [
      { name: "حاضر", value: data.stats.presentCount, color: statusColors.present },
      { name: "غائب", value: data.stats.absentCount, color: statusColors.absent },
      { name: "متأخر", value: data.stats.lateCount, color: statusColors.late },
      { name: "إجازة", value: data.stats.leaveCount, color: statusColors.leave }
    ].filter(item => item.value > 0);
  }, [data]);
  
  const scheduleData = useMemo(() => {
    if (!data?.stats.byScheduleType) return [];
    
    return data.stats.byScheduleType.map(schedule => ({
      name: schedule.name,
      حاضر: schedule.present,
      غائب: schedule.absent,
      متأخر: schedule.late,
      إجازة: schedule.leave
    }));
  }, [data]);
  
  const employeeData = useMemo(() => {
    if (!data?.employeeStats) return [];
    
    // Only show top 10 employees for readability
    return data.employeeStats
      .sort((a, b) => (b.present + b.absent + b.late + b.leave) - (a.present + a.absent + a.late + a.leave))
      .slice(0, 10)
      .map(emp => ({
        name: emp.employee_name,
        حاضر: emp.present,
        غائب: emp.absent,
        متأخر: emp.late,
        إجازة: emp.leave
      }));
  }, [data]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <div className="w-full h-full bg-gray-100 rounded-md animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-10">
          <EmptyState
            icon={<PieChartIcon className="h-8 w-8 text-muted-foreground" />}
            title="خطأ في تحميل البيانات"
            description="يرجى المحاولة مرة أخرى لاحقاً"
          />
        </CardContent>
      </Card>
    );
  }
  
  if (!data || statusData.length === 0) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-10">
          <EmptyState
            icon={<PieChartIcon className="h-8 w-8 text-muted-foreground" />}
            title="لا توجد بيانات للعرض"
            description="لا توجد إحصائيات حضور خلال الفترة المحددة"
          />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>توزيع الحضور حسب الحالة</CardTitle>
          <CardDescription>نسبة الحضور والغياب والتأخير والإجازات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} مرة`, 'عدد المرات']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {scheduleData.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>الحضور حسب نوع الدوام</CardTitle>
            <CardDescription>توزيع الحضور والغياب لكل نوع من أنواع الدوام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scheduleData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="حاضر" stackId="a" fill={statusColors.present} />
                  <Bar dataKey="غائب" stackId="a" fill={statusColors.absent} />
                  <Bar dataKey="متأخر" stackId="a" fill={statusColors.late} />
                  <Bar dataKey="إجازة" stackId="a" fill={statusColors.leave} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {employeeData.length > 0 && !employeeId && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>الحضور حسب الموظف</CardTitle>
            <CardDescription>توزيع الحضور والغياب لأكثر 10 موظفين</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeeData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="حاضر" stackId="a" fill={statusColors.present} />
                  <Bar dataKey="غائب" stackId="a" fill={statusColors.absent} />
                  <Bar dataKey="متأخر" stackId="a" fill={statusColors.late} />
                  <Bar dataKey="إجازة" stackId="a" fill={statusColors.leave} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
