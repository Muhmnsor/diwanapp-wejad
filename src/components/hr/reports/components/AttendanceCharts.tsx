
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChartIcon, PieChartIcon } from "lucide-react";

interface AttendanceChartsProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AttendanceCharts({ startDate, endDate, employeeId }: AttendanceChartsProps) {
  // Fetch attendance data for charts
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance-charts', startDate?.toISOString(), endDate?.toISOString(), employeeId],
    queryFn: async () => {
      if (!startDate || !endDate) return null;
      
      console.log(`Fetching attendance data for charts from ${startDate} to ${endDate} for employee ${employeeId || 'all'}`);
      
      let query = supabase
        .from('employee_attendance')
        .select(`
          id,
          employee_id,
          check_in_time,
          check_out_time,
          late_minutes,
          weekend,
          holiday,
          employees (full_name)
        `)
        .gte('check_in_time', startDate.toISOString())
        .lte('check_in_time', endDate.toISOString());
      
      // Add employee filter if provided
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching attendance chart data:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!startDate && !!endDate
  });

  // Process data for the daily attendance chart
  const dailyAttendanceData = React.useMemo(() => {
    if (!startDate || !endDate || !attendanceData) return [];
    
    // Create an array of all days in the interval
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Map each day to count attendances
    return days.map(day => {
      const dayAttendances = attendanceData.filter(record => {
        const recordDate = new Date(record.check_in_time);
        return isSameDay(day, recordDate);
      });
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        displayDate: format(day, 'dd MMM', { locale: ar }),
        count: dayAttendances.length,
        lateCount: dayAttendances.filter(record => record.late_minutes > 0).length
      };
    });
  }, [startDate, endDate, attendanceData]);

  // Process data for the employee attendance pie chart
  const employeeAttendanceData = React.useMemo(() => {
    if (!attendanceData || attendanceData.length === 0 || employeeId) return [];
    
    // Group by employee
    const employeeMap = new Map();
    
    attendanceData.forEach(record => {
      const employeeName = record.employees?.full_name || 'غير معروف';
      const employeeId = record.employee_id;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          name: employeeName,
          value: 0
        });
      }
      
      employeeMap.get(employeeId).value += 1;
    });
    
    // Convert map to array and sort
    return Array.from(employeeMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5
  }, [attendanceData, employeeId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!attendanceData || attendanceData.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <EmptyState
            icon={<BarChartIcon className="h-8 w-8 text-muted-foreground" />}
            title="لا توجد بيانات حضور"
            description="لا توجد بيانات حضور خلال هذه الفترة"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Daily Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>الحضور اليومي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyAttendanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="displayDate" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    return [value, name === 'count' ? 'الحضور' : 'التأخير'];
                  }}
                  labelFormatter={(label) => `التاريخ: ${label}`}
                />
                <Bar dataKey="count" name="الحضور" fill="#82ca9d" />
                <Bar dataKey="lateCount" name="التأخير" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Employee Attendance Distribution Pie Chart - Only show when not filtering for a specific employee */}
      {!employeeId && employeeAttendanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع الحضور حسب الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeAttendanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {employeeAttendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
