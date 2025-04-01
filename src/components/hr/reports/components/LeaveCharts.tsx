
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Sample data - replace with actual data fetching in a production environment
const leaveData = {
  monthly: [
    { name: "إجازة سنوية", value: 20 },
    { name: "إجازة مرضية", value: 15 },
    { name: "إجازة استثنائية", value: 5 },
    { name: "إجازة أمومة", value: 2 },
  ],
  quarterly: [
    { name: "إجازة سنوية", value: 65 },
    { name: "إجازة مرضية", value: 38 },
    { name: "إجازة استثنائية", value: 12 },
    { name: "إجازة أمومة", value: 7 },
  ],
  yearly: [
    { name: "إجازة سنوية", value: 240 },
    { name: "إجازة مرضية", value: 120 },
    { name: "إجازة استثنائية", value: 45 },
    { name: "إجازة أمومة", value: 25 },
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface LeaveChartsProps {
  period: "yearly" | "quarterly" | "monthly";
}

export function LeaveCharts({ period }: LeaveChartsProps) {
  const data = leaveData[period];
  
  // Fix the comparison error by using proper equality check for string literals
  const isLongPeriod = period === "yearly" || period === "quarterly";
  
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
