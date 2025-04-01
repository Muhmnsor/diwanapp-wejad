
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck } from "lucide-react";

interface EmployeeStatsProps {
  department: "all" | "engineering" | "marketing" | "hr";
}

export function EmployeeStats({ department }: EmployeeStatsProps) {
  // Sample data - in a real app, we would fetch this from an API
  const getDepartmentData = () => {
    switch (department) {
      case "engineering":
        return { total: 15, active: 14, onLeave: 1 };
      case "marketing":
        return { total: 8, active: 7, onLeave: 1 };
      case "hr":
        return { total: 5, active: 5, onLeave: 0 };
      case "all":
      default:
        return { total: 28, active: 26, onLeave: 2 };
    }
  };
  
  const stats = getDepartmentData();
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {department === "all" ? "في جميع الأقسام" : `في قسم ${
              department === "engineering" ? "الهندسة" : 
              department === "marketing" ? "التسويق" : "الموارد البشرية"
            }`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الموظفين النشطين</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.active / stats.total) * 100)}% من إجمالي الموظفين
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.onLeave}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.onLeave / stats.total) * 100)}% من إجمالي الموظفين
          </p>
        </CardContent>
      </Card>
    </>
  );
}
