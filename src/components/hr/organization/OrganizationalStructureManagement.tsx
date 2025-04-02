
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { OrganizationTreeView } from "./OrganizationTreeView";
import { OrganizationChart } from "./OrganizationChart";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { OrganizationalUnitDialog } from "./OrganizationalUnitDialog";
import { Plus, Users, Building2, FileText } from "lucide-react";

export function OrganizationalStructureManagement() {
  const { data: units, isLoading, refetch } = useOrganizationalUnits();
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("tree");
  
  const selectedUnit = units?.find(unit => unit.id === selectedUnitId);
  
  const handleUnitClick = (unit: any) => {
    setSelectedUnitId(unit.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الهيكل التنظيمي</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة وحدة
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Building2 className="ml-2 h-5 w-5 text-primary" />
              الوحدات التنظيمية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : units && units.length > 0 ? (
              <OrganizationTreeView
                units={units}
                onUnitClick={handleUnitClick}
                selectedUnitId={selectedUnitId}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">لا توجد وحدات تنظيمية</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة وحدة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {selectedUnit ? selectedUnit.name : "تفاصيل الوحدة"}
                </CardTitle>
                <TabsList>
                  <TabsTrigger value="tree">
                    <FileText className="h-4 w-4 ml-2" />
                    تفاصيل
                  </TabsTrigger>
                  <TabsTrigger value="chart">
                    <Building2 className="h-4 w-4 ml-2" />
                    المخطط
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="tree" className="mt-0">
              {selectedUnitId ? (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">معلومات الوحدة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">النوع</p>
                        <p>{selectedUnit?.unit_type === "department" 
                            ? "إدارة" 
                            : selectedUnit?.unit_type === "division" 
                            ? "قسم" 
                            : "فريق"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">الحالة</p>
                        <p>{selectedUnit?.is_active ? "نشط" : "غير نشط"}</p>
                      </div>
                      {selectedUnit?.description && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">الوصف</p>
                          <p>{selectedUnit.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4 flex items-center">
                      <Users className="ml-2 h-5 w-5 text-primary" />
                      <h3 className="font-medium">الموظفين</h3>
                    </div>
                    <OrganizationalUnitEmployees unitId={selectedUnitId} />
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">الرجاء اختيار وحدة تنظيمية من القائمة</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="chart" className="mt-0">
              <OrganizationChart />
            </TabsContent>
          </CardContent>
        </Card>
      </div>
      
      <OrganizationalUnitDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
