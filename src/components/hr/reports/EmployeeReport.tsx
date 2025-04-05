import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeCharts } from "./components/EmployeeCharts";
import { EmployeeStats } from "./components/EmployeeStats";
import { useOrganizationalUnitsByType } from "@/hooks/hr/useOrganizationalUnitsByType";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function EmployeeReport({ startDate, endDate }: EmployeeReportProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const { data: units, isLoading } = useOrganizationalUnitsByType("department");
  
  // Reset selection when units change
  useEffect(() => {
    if (units && units.length > 0) {
      setSelectedUnitId("all");
    }
  }, [units]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الموظفين</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الموظفين حسب الأقسام
          </p>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-10 w-[400px]" />
        ) : (
          <Tabs value={selectedUnitId} onValueChange={(v) => setSelectedUnitId(v)} className="w-[400px]">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(units?.length + 1 || 2, 6)}, 1fr)` }}>
              <TabsTrigger value="all">الكل</TabsTrigger>
              {units?.map(unit => (
                <TabsTrigger key={unit.id} value={unit.id}>{unit.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
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
