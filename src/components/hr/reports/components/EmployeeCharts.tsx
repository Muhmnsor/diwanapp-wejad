
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface EmployeeChartsProps {
  department: "all" | "engineering" | "marketing" | "hr";
}

export function EmployeeCharts({ department }: EmployeeChartsProps) {
  // Sample data - in a real app, we would fetch this from an API
  const getDepartmentDistribution = () => [
    { name: "الهندسة", value: 15, color: "#4ade80" },
    { name: "التسويق", value: 8, color: "#facc15" },
    { name: "الموارد البشرية", value: 5, color: "#f87171" },
  ];
  
  const getContractTypeDistribution = () => {
    switch (department) {
      case "engineering":
        return [
          { name: "دوام كامل", value: 12, color: "#4ade80" },
          { name: "دوام جزئي", value: 2, color: "#facc15" },
          { name: "تعاقد", value: 1, color: "#f87171" },
        ];
      case "marketing":
        return [
          { name: "دوام كامل", value: 5, color: "#4ade80" },
          { name: "دوام جزئي", value: 3, color: "#facc15" },
          { name: "تعاقد", value: 0, color: "#f87171" },
        ];
      case "hr":
        return [
          { name: "دوام كامل", value: 5, color: "#4ade80" },
          { name: "دوام جزئي", value: 0, color: "#facc15" },
          { name: "تعاقد", value: 0, color: "#f87171" },
        ];
      case "all":
      default:
        return [
          { name: "دوام كامل", value: 22, color: "#4ade80" },
          { name: "دوام جزئي", value: 5, color: "#facc15" },
          { name: "تعاقد", value: 1, color: "#f87171" },
        ];
    }
  };
  
  const departmentData = getDepartmentDistribution();
  const contractTypeData = getContractTypeDistribution();
  
  return (
    <>
      {department === "all" && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
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
      
      <Card className={department === "all" ? "" : "col-span-2"}>
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
    </>
  );
}
