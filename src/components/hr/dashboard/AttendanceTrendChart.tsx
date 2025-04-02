
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";

export function AttendanceTrendChart() {
  const { data: stats, isLoading } = useHRStats();
  
  // Sample data - this would come from the API in a real implementation
  const weeklyAttendanceData = [
    { name: 'الأحد', present: 22, late: 3, absent: 3 },
    { name: 'الإثنين', present: 24, late: 2, absent: 2 },
    { name: 'الثلاثاء', present: 23, late: 4, absent: 1 },
    { name: 'الأربعاء', present: 25, late: 1, absent: 2 },
    { name: 'الخميس', present: 20, late: 5, absent: 3 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">اتجاهات الحضور الأسبوعية</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.weeklyAttendanceData || weeklyAttendanceData}
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
                <Bar dataKey="present" name="حاضر" fill="#4ade80" />
                <Bar dataKey="late" name="متأخر" fill="#facc15" />
                <Bar dataKey="absent" name="غائب" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
