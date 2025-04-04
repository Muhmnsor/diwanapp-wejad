// src/components/hr/reports/components/LeaveCharts.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useLeaveChartData } from "@/hooks/hr/useLeaveChartData";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface LeaveChartsProps {
  period: "yearly" | "quarterly" | "monthly";
  startDate?: Date;
  endDate?: Date;
}

export function LeaveCharts({ period, startDate, endDate }: LeaveChartsProps) {
  const { data: chartData, isLoading, isError } = useLeaveChartData(period, startDate, endDate);
  
  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>نسب الإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </>
    );
  }

  if (isError || !chartData) {
    return (
      <Card className="col-span-2">
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الرسم البياني</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Use the data for the current period
  const data = chartData[period] || [];
  
  // If there's no data, show empty state
  if (data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">لا توجد بيانات إجازات في هذه الفترة</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نسب الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
