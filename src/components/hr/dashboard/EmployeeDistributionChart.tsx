
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";

const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#c084fc'];

export function EmployeeDistributionChart() {
  const { data: stats, isLoading } = useHRStats();
  
  // Sample data - this would come from the API in a real implementation
  const departmentData = [
    { name: 'الإدارة', value: 5 },
    { name: 'تقنية المعلومات', value: 8 },
    { name: 'الموارد البشرية', value: 4 },
    { name: 'المالية', value: 3 },
    { name: 'التسويق', value: 6 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">توزيع الموظفين حسب الإدارات</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.employeesByDepartment || departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.employeesByDepartment || departmentData).map((entry, index) => (
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
