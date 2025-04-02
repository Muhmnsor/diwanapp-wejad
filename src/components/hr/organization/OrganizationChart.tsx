
import React, { useState } from "react";
import { useOrganizationalHierarchy } from "@/hooks/hr/useOrganizationalHierarchy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationFlowChart } from "./OrganizationFlowChart";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { ReactFlowProvider } from "@xyflow/react";

export function OrganizationChart() {
  const { data: units, isLoading, error } = useOrganizationalHierarchy();
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>();

  const handleUnitClick = (unit: any) => {
    setSelectedUnitId(unit.id);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>الهيكل التنظيمي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">جاري تحميل الهيكل التنظيمي...</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">يرجى اختيار قسم</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>الهيكل التنظيمي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-red-500">حدث خطأ أثناء تحميل الهيكل التنظيمي</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>الهيكل التنظيمي</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactFlowProvider>
            <OrganizationFlowChart 
              units={units || []} 
              onUnitClick={handleUnitClick}
              selectedUnitId={selectedUnitId}
            />
          </ReactFlowProvider>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedUnitId ? (
            <OrganizationalUnitEmployees unitId={selectedUnitId} />
          ) : (
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground">يرجى اختيار قسم لعرض الموظفين</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
