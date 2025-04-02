
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";

const COLORS = ['#4ade80', '#facc15', '#f87171'];

export function EmployeeStatusChart() {
  const { data: stats, isLoading } = useHRStats();
  
  // Sample data - this would come from the API in a real implementation
  const statusData = [
    { name: 'دوام كامل', value: 20 },
    { name: 'دوام جزئي', value: 5 },
    { name: 'متعاقد', value: 3 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">الموظفين حسب نوع العقد</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.employeesByContractType || statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.employeesByContractType || statusData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
