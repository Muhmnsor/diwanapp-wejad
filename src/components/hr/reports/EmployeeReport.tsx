
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeCharts } from "./components/EmployeeCharts";
import { EmployeeStats } from "./components/EmployeeStats";

export function EmployeeReport() {
  const [department, setDepartment] = useState<"all" | "engineering" | "marketing" | "hr">("all");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الموظفين</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الموظفين حسب الأقسام
          </p>
        </div>
        
        <Tabs value={department} onValueChange={(v) => setDepartment(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="engineering">الهندسة</TabsTrigger>
            <TabsTrigger value="marketing">التسويق</TabsTrigger>
            <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EmployeeStats department={department} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <EmployeeCharts department={department} />
      </div>
    </div>
  );
}
