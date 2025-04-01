
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface LeaveChartsProps {
  period: "yearly" | "quarterly" | "monthly";
}

export function LeaveCharts({ period }: LeaveChartsProps) {
  // Sample data - in a real app, we would fetch this from an API
  const getLeaveTypeData = () => [
    { name: "سنوية", value: period === "yearly" ? 70 : period === "quarterly" ? 20 : 8, color: "#4ade80" },
    { name: "مرضية", value: period === "yearly" ? 30 : period === "quarterly" ? 10 : 4, color: "#facc15" },
    { name: "عائلية", value: period === "yearly" ? 15 : period === "quarterly" ? 8 : 2, color: "#f87171" },
    { name: "أخرى", value: period === "yearly" ? 5 : period === "quarterly" ? 2 : 1, color: "#94a3b8" },
  ];
  
  const getMonthlyData = () => [
    { name: "يناير", annual: 6, sick: 2, family: 1, other: 0 },
    { name: "فبراير", annual: 5, sick: 3, family: 1, other: 1 },
    { name: "مارس", annual: 7, sick: 2, family: 2, other: 0 },
    { name: "أبريل", annual: 8, sick: 1, family: 0, other: 0 },
    { name: "مايو", annual: 4, sick: 3, family: 1, other: 0 },
    { name: "يونيو", annual: 5, sick: 1, family: 1, other: 1 },
    { name: "يوليو", annual: 6, sick: 2, family: 0, other: 0 },
    { name: "أغسطس", annual: 10, sick: 4, family: 2, other: 1 },
    { name: "سبتمبر", annual: 6, sick: 5, family: 2, other: 0 },
    { name: "أكتوبر", annual: 5, sick: 3, family: 2, other: 1 },
    { name: "نوفمبر", annual: 4, sick: 2, family: 1, other: 0 },
    { name: "ديسمبر", annual: 4, sick: 2, family: 2, other: 1 },
  ];
  
  const getQuarterlyData = () => [
    { name: "الربع الأول", annual: 18, sick: 7, family: 4, other: 1 },
    { name: "الربع الثاني", annual: 17, sick: 5, family: 2, other: 1 },
    { name: "الربع الثالث", annual: 22, sick: 11, family: 4, other: 1 },
    { name: "الربع الرابع", annual: 13, sick: 7, family: 5, other: 2 },
  ];
  
  const leaveTypeData = getLeaveTypeData();
  const timeSeriesData = period === "yearly" 
    ? period === "quarterly" 
      ? getQuarterlyData() 
      : getMonthlyData() 
    : period === "quarterly" 
      ? getQuarterlyData() 
      : getMonthlyData().slice(0, 3); // Just show first 3 months for monthly view
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>توزيع أنواع الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإجازات عبر الوقت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeSeriesData}
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
                <Legend />
                <Bar dataKey="annual" name="سنوية" fill="#4ade80" />
                <Bar dataKey="sick" name="مرضية" fill="#facc15" />
                <Bar dataKey="family" name="عائلية" fill="#f87171" />
                <Bar dataKey="other" name="أخرى" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
