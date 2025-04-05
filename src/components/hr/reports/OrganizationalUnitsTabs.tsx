
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationalUnitsByType } from "@/hooks/hr/useOrganizationalUnitsByType";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationalUnitsTabsProps {
  unitId: string;
  onUnitChange: (unitId: string) => void;
  unitType?: string;
  maxTabs?: number;
}

export function OrganizationalUnitsTabs({ 
  unitId, 
  onUnitChange, 
  unitType = "department",
  maxTabs = 3 
}: OrganizationalUnitsTabsProps) {
  const { data: units, isLoading } = useOrganizationalUnitsByType(unitType);
  
  // If no unit is selected and we have units data, select the first one
  useEffect(() => {
    if (unitId === "all" && units && units.length > 0) {
      onUnitChange(units[0].id);
    }
  }, [units, unitId, onUnitChange]);
  
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }
  
  return (
    <Tabs value={unitId} onValueChange={onUnitChange} className="w-[400px]">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min((units?.length || 0) + 1, maxTabs + 1)}, 1fr)` }}>
        <TabsTrigger value="all">الكل</TabsTrigger>
        {units && units.slice(0, maxTabs).map(unit => (
          <TabsTrigger key={unit.id} value={unit.id}>
            {unit.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
