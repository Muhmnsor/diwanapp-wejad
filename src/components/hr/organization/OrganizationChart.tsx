
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OrganizationTreeView } from "@/components/hr/organization/OrganizationTreeView";
import { OrganizationalUnitEmployees } from "@/components/hr/organization/OrganizationalUnitEmployees";
import { OrganizationalUnitDetails } from "@/components/hr/organization/OrganizationalUnitDetails";
import { useOrganizationalHierarchy } from "@/hooks/hr/useOrganizationalHierarchy";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationChart() {
  const { data: units, isLoading } = useOrganizationalHierarchy();
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>();
  
  // Find the selected unit
  const selectedUnit = units?.find(unit => unit.id === selectedUnitId);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">الهيكل التنظيمي</h3>
          <OrganizationTreeView 
            units={units || []} 
            onUnitClick={(unit) => setSelectedUnitId(unit.id)}
            selectedUnitId={selectedUnitId}
          />
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          {selectedUnit ? (
            <div className="space-y-6">
              <OrganizationalUnitDetails unit={selectedUnit} />
              <OrganizationalUnitEmployees unitId={selectedUnit.id} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              اختر وحدة تنظيمية لعرض التفاصيل
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
