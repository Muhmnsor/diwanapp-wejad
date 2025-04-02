
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, RefreshCw, ChevronRight, ChevronDown } from "lucide-react";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { OrganizationalUnitDialog } from "./OrganizationalUnitDialog";
import { OrganizationTreeView } from "./OrganizationTreeView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationalUnitEmployees } from "./OrganizationalUnitEmployees";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationalStructureManagement() {
  const { data: units, isLoading, isError, refetch } = useOrganizationalUnits();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedUnit(null);
      setEditMode(false);
    }
  }, [isDialogOpen]);

  const handleCreateUnit = () => {
    setSelectedUnit(null);
    setEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEditUnit = (unit: any) => {
    setSelectedUnit(unit);
    setEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUnitClick = (unit: any) => {
    setSelectedUnit(unit);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "تم تحديث البيانات",
      description: "تم تحديث هيكل المنظمة بنجاح",
    });
  };

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>هيكل المنظمة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">حدث خطأ أثناء تحميل هيكل المنظمة</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="ml-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">هيكل المنظمة</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={handleCreateUnit} size="sm">
            <Plus className="ml-2 h-4 w-4" />
            إضافة وحدة تنظيمية
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">الوحدات التنظيمية</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <OrganizationTreeView 
                units={units || []} 
                onUnitClick={handleUnitClick} 
                selectedUnitId={selectedUnit?.id} 
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {selectedUnit ? selectedUnit.name : "تفاصيل الوحدة التنظيمية"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUnit ? (
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">التفاصيل</TabsTrigger>
                  <TabsTrigger value="employees">الموظفين</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">اسم الوحدة</h3>
                      <p className="text-muted-foreground">{selectedUnit.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">نوع الوحدة</h3>
                      <p className="text-muted-foreground">{selectedUnit.unit_type}</p>
                    </div>
                    {selectedUnit.description && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium mb-1">الوصف</h3>
                        <p className="text-muted-foreground">{selectedUnit.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleEditUnit(selectedUnit)} variant="outline" size="sm">
                      <Edit className="ml-2 h-4 w-4" />
                      تعديل
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash className="ml-2 h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="employees">
                  <OrganizationalUnitEmployees unitId={selectedUnit.id} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">
                  يرجى اختيار وحدة تنظيمية من القائمة لعرض التفاصيل
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isDialogOpen && (
        <OrganizationalUnitDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editMode={editMode}
          unit={selectedUnit}
          units={units || []}
          onSuccess={() => {
            refetch();
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
