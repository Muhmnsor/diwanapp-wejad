import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEmployeeChartData } from "@/hooks/hr/useEmployeeChartData";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeChartsProps {
  unitId: string;
}

export function EmployeeCharts({ unitId }: EmployeeChartsProps) {
  const { data: chartData, isLoading, isError } = useEmployeeChartData(unitId);
  
  if (isLoading) {
    return (
      <>
        <Skeleton className="h-[300px] w-full" />
        {unitId === "all" && <Skeleton className="h-[300px] w-full" />}
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
  
  // Use the data returned from the hook
  const departmentData = chartData.departmentDistribution;
  const contractTypeData = chartData.contractTypeDistribution;
  
  // If there's no data, show empty state
  if (departmentData.length === 0 && contractTypeData.length === 0) {
    return (
      <Card className="col-span-2">
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">لا توجد بيانات موظفين في هذا القسم</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {unitId === "all" && departmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب الوحدات التنظيمية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.map((entry, index) => (
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
      )}
      
      {contractTypeData.length > 0 && (
        <Card className={unitId === "all" ? "" : "col-span-2"}>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب نوع العقد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contractTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contractTypeData.map((entry, index) => (
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
      )}
    </>
  );
}
