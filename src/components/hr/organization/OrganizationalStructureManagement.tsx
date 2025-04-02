
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationalUnitDialog } from "./OrganizationalUnitDialog";
import { OrganizationalChart } from "./OrganizationalChart";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { OrganizationalHierarchyItem } from "@/hooks/hr/useOrganizationalHierarchy";
import { Plus } from "lucide-react";

export function OrganizationalStructureManagement() {
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const { refetch } = useOrganizationalUnits();

  const handleUnitClick = (unit: OrganizationalHierarchyItem) => {
    setSelectedUnit({
      id: unit.id,
      name: unit.name,
      description: unit.description,
      unit_type: unit.unit_type,
      parent_id: unit.parent_id
    });
  };

  const handleUnitAdded = () => {
    refetch();
  };

  const handleAddUnitClick = () => {
    setSelectedUnit(null);
    setIsUnitDialogOpen(true);
  };

  const handleEditUnitClick = () => {
    if (selectedUnit) {
      setIsUnitDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الهيكل التنظيمي</h2>
        <div className="flex gap-2">
          <Button onClick={handleAddUnitClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            إضافة وحدة جديدة
          </Button>
          <Button
            variant="outline"
            onClick={handleEditUnitClick}
            disabled={!selectedUnit}
          >
            تعديل الوحدة المحددة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OrganizationalChart 
            onUnitClick={handleUnitClick} 
            selectedUnitId={selectedUnit?.id} 
          />
        </div>

        <div className="space-y-6">
          {selectedUnit ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {selectedUnit.name} - {getUnitTypeDisplay(selectedUnit.unit_type)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUnit.description && (
                  <p className="text-sm text-muted-foreground mb-4">{selectedUnit.description}</p>
                )}
                <OrganizationalUnitEmployees unitId={selectedUnit.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>يرجى اختيار وحدة تنظيمية من الهيكل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <OrganizationalUnitDialog
        isOpen={isUnitDialogOpen}
        onClose={() => setIsUnitDialogOpen(false)}
        unitToEdit={selectedUnit}
        onUnitAdded={handleUnitAdded}
      />
    </div>
  );
}

function getUnitTypeDisplay(unitType: string): string {
  switch (unitType) {
    case 'division':
      return 'إدارة';
    case 'department':
      return 'قسم';
    case 'team':
      return 'فريق';
    case 'unit':
      return 'وحدة';
    default:
      return unitType;
  }
}
