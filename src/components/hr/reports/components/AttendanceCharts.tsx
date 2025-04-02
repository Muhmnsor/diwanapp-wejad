
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AttendanceChartsProps {
  period: "daily" | "weekly" | "monthly";
}

export function AttendanceCharts({ period }: AttendanceChartsProps) {
  // Sample data - in a real app, we would fetch this from an API
  const getDailyData = () => [
    { name: "8 ص", present: 10, late: 2, absent: 1 },
    { name: "9 ص", present: 15, late: 3, absent: 1 },
    { name: "10 ص", present: 18, late: 2, absent: 2 },
    { name: "11 ص", present: 18, late: 1, absent: 2 },
    { name: "12 م", present: 19, late: 0, absent: 2 },
  ];
  
  const getWeeklyData = () => [
    { name: "الأحد", present: 18, late: 2, absent: 1 },
    { name: "الإثنين", present: 17, late: 3, absent: 1 },
    { name: "الثلاثاء", present: 16, late: 2, absent: 3 },
    { name: "الأربعاء", present: 19, late: 1, absent: 1 },
    { name: "الخميس", present: 15, late: 4, absent: 2 },
  ];
  
  const getMonthlyData = () => [
    { name: "أسبوع 1", present: 85, late: 10, absent: 5 },
    { name: "أسبوع 2", present: 82, late: 12, absent: 6 },
    { name: "أسبوع 3", present: 88, late: 8, absent: 4 },
    { name: "أسبوع 4", present: 85, late: 10, absent: 5 },
  ];
  
  const chartData = period === "daily" 
    ? getDailyData() 
    : period === "weekly" 
      ? getWeeklyData() 
      : getMonthlyData();
  
  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>الحضور والغياب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#4ade80" name="حضور" />
                <Bar dataKey="late" fill="#facc15" name="تأخير" />
                <Bar dataKey="absent" fill="#f87171" name="غياب" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
