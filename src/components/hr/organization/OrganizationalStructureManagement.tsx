
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { OrganizationTreeView } from "./OrganizationTreeView";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { OrganizationalUnitDialog } from "./OrganizationalUnitDialog";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الهيكل التنظيمي</h2>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة وحدة تنظيمية
        </Button>
      </div>
      
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
                  </p>
                </div>
                
                {selectedUnit.description && (
                  <div>
                    <h3 className="font-medium mb-1">الوصف</h3>
                    <p>{selectedUnit.description}</p>
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
      
      <OrganizationalUnitDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        unitToEdit={unitToEdit}
        onUnitAdded={handleUnitAdded}
      />
    </div>
  );
}
