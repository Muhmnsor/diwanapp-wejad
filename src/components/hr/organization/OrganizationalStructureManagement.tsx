
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { OrganizationTreeView } from "./OrganizationTreeView";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { OrganizationalUnitDialog } from "./OrganizationalUnitDialog";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { OrganizationChart } from "./OrganizationChart";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
}

export function OrganizationalStructureManagement() {
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<OrganizationalUnit | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'chart'>('tree');
  
  const { data: units = [], refetch: refetchUnits, isLoading } = useOrganizationalUnits();
  
  const handleAddClick = () => {
    setUnitToEdit(null);
    setShowAddDialog(true);
  };
  
  const handleUnitClick = (unit: OrganizationalUnit) => {
    setSelectedUnitId(unit.id);
  };
  
  const handleEditClick = () => {
    const unit = units.find(u => u.id === selectedUnitId);
    if (unit) {
      setUnitToEdit(unit);
      setShowAddDialog(true);
    }
  };
  
  const handleUnitAdded = () => {
    refetchUnits();
  };

  const selectedUnit = units.find(unit => unit.id === selectedUnitId);

  // Find parent unit if available
  const parentUnit = selectedUnit?.parent_id 
    ? units.find(unit => unit.id === selectedUnit.parent_id) 
    : undefined;

  // Find child units if available
  const childUnits = units.filter(unit => unit.parent_id === selectedUnitId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الهيكل التنظيمي</h2>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'tree' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            عرض الشجرة
          </Button>
          <Button 
            variant={viewMode === 'chart' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('chart')}
          >
            الهيكل التنظيمي
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة وحدة تنظيمية
          </Button>
        </div>
      </div>
      
      {viewMode === 'chart' ? (
        <div className="mt-4">
          <OrganizationChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>الوحدات التنظيمية</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-4">جاري التحميل...</div>
              ) : (
                <OrganizationTreeView 
                  units={units}
                  onUnitClick={handleUnitClick}
                  selectedUnitId={selectedUnitId}
                />
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{selectedUnit ? selectedUnit.name : "تفاصيل الوحدة التنظيمية"}</CardTitle>
              {selectedUnit && (
                <Button variant="outline" onClick={handleEditClick}>
                  تعديل
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {selectedUnit ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">النوع</h3>
                    <p>
                      {selectedUnit.unit_type === "department" && "قسم"}
                      {selectedUnit.unit_type === "division" && "إدارة"}
                      {selectedUnit.unit_type === "team" && "فريق"}
                      {selectedUnit.unit_type === "unit" && "وحدة"}
                    </p>
                  </div>
                  
                  {selectedUnit.description && (
                    <div>
                      <h3 className="font-medium mb-1">الوصف</h3>
                      <p>{selectedUnit.description}</p>
                    </div>
                  )}
                  
                  {parentUnit && (
                    <div>
                      <h3 className="font-medium mb-1">الوحدة الأم</h3>
                      <div className="p-2 bg-muted/50 rounded-md flex items-center">
                        <span className="font-medium text-sm">{parentUnit.name}</span>
                        <span className="mx-2 text-xs text-muted-foreground">
                          ({parentUnit.unit_type === "department" && "قسم"}
                          {parentUnit.unit_type === "division" && "إدارة"}
                          {parentUnit.unit_type === "team" && "فريق"}
                          {parentUnit.unit_type === "unit" && "وحدة"})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {childUnits.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-1">الوحدات الفرعية</h3>
                      <div className="space-y-1">
                        {childUnits.map(child => (
                          <div 
                            key={child.id}
                            className="p-2 bg-muted/50 rounded-md flex items-center justify-between cursor-pointer hover:bg-muted"
                            onClick={() => setSelectedUnitId(child.id)}
                          >
                            <span className="font-medium text-sm">{child.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({child.unit_type === "department" && "قسم"}
                              {child.unit_type === "division" && "إدارة"}
                              {child.unit_type === "team" && "فريق"}
                              {child.unit_type === "unit" && "وحدة"})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-2">الموظفين</h3>
                    <OrganizationalUnitEmployees unitId={selectedUnit.id} />
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  يرجى اختيار وحدة تنظيمية لعرض التفاصيل
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <OrganizationalUnitDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        unitToEdit={unitToEdit}
        onUnitAdded={handleUnitAdded}
      />
    </div>
  );
}
