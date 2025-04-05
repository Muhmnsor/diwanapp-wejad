
// src/components/hr/reports/EmployeeReport.tsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeCharts } from "./components/EmployeeCharts";
import { EmployeeStats } from "./components/EmployeeStats";
import { OrganizationalUnitsTabs } from "./OrganizationalUnitsTabs";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function EmployeeReport({ startDate, endDate }: EmployeeReportProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الموظفين</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الموظفين حسب الإدارات
          </p>
        </div>
        
        <OrganizationalUnitsTabs 
          unitId={selectedUnitId}
          onUnitChange={setSelectedUnitId}
          unitType="department"
          maxTabs={3}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EmployeeStats unitId={selectedUnitId} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <EmployeeCharts unitId={selectedUnitId} />
      </div>
    </div>
  );
}
