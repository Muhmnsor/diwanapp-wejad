
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationTreeView } from "./OrganizationTreeView";
import { OrganizationChart } from "./OrganizationChart";
import { useOrganizationalHierarchy } from "@/hooks/hr/useOrganizationalHierarchy";
import { AddOrganizationalUnitDialog } from "./AddOrganizationalUnitDialog";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";

export function OrganizationalStructureManagement() {
  const { data: orgHierarchy = [], isLoading } = useOrganizationalHierarchy();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const handleUnitAdded = () => {
    // إعادة تحميل البيانات بعد إضافة وحدة جديدة
    setSelectedUnitId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الهيكل التنظيمي</h2>
        <AddOrganizationalUnitDialog onUnitAdded={handleUnitAdded} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>الوحدات التنظيمية</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-40 bg-gray-100 rounded-md"></div>
            ) : (
              <OrganizationTreeView 
                data={orgHierarchy} 
                onUnitSelect={handleUnitSelect} 
              />
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUnitId ? "تفاصيل الوحدة التنظيمية" : "مخطط الهيكل التنظيمي"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUnitId ? (
              <OrganizationalUnitEmployees unitId={selectedUnitId} />
            ) : (
              <Tabs defaultValue="tree">
                <TabsList className="mb-4">
                  <TabsTrigger value="tree">عرض شجري</TabsTrigger>
                  <TabsTrigger value="chart">مخطط تنظيمي</TabsTrigger>
                </TabsList>
                <TabsContent value="tree">
                  {isLoading ? (
                    <div className="animate-pulse h-60 bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="border rounded-md p-4 max-h-96 overflow-auto">
                      <OrganizationTreeView 
                        data={orgHierarchy}
                        onUnitSelect={handleUnitSelect}
                        expandAll
                      />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="chart">
                  {isLoading ? (
                    <div className="animate-pulse h-60 bg-gray-100 rounded-md"></div>
                  ) : (
                    <div className="border rounded-md p-4 max-h-96 overflow-auto">
                      <OrganizationChart data={orgHierarchy} />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
