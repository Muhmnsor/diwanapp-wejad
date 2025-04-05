import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeCharts } from "./components/EmployeeCharts";
import { EmployeeStats } from "./components/EmployeeStats";
import { useOrganizationalUnitsByType } from "@/hooks/hr/useOrganizationalUnitsByType";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeReportTable } from "./components/EmployeeReportTable";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function EmployeeReport({ startDate, endDate }: EmployeeReportProps) {
  const [selectedUnitType, setSelectedUnitType] = useState<string>("department");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
  const { data: units, isLoading } = useOrganizationalUnitsByType(selectedUnitType);
  
  // Reset selection when unit type or units change
  useEffect(() => {
    if (units && units.length > 0) {
      setSelectedUnitId("all");
    }
  }, [units, selectedUnitType]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الموظفين</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الموظفين حسب الهيكل التنظيمي
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={selectedUnitType}
            onValueChange={(value) => setSelectedUnitType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نوع الوحدة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department">الإدارات</SelectItem>
              <SelectItem value="section">الأقسام</SelectItem>
              <SelectItem value="unit">الوحدات</SelectItem>
              <SelectItem value="team">الفرق</SelectItem>
            </SelectContent>
          </Select>
          
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
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EmployeeStats unitId={selectedUnitId} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <EmployeeCharts unitId={selectedUnitId} />
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>قائمة الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeReportTable unitId={selectedUnitId} unitType={selectedUnitType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
