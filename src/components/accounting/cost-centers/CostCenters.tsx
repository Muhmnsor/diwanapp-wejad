
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Eye, EyeOff } from "lucide-react";
import { useCostCenters } from "@/hooks/accounting/useCostCenters";
import { CostCenterForm } from "./CostCenterForm";
import { CostCentersTable } from "./CostCentersTable";
import { useCostCenterOperations } from "@/hooks/accounting/useCostCenterOperations";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const CostCenters = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<any>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  
  const { costCenters, isLoading, error } = useCostCenters();
  const { toggleCostCenterStatus } = useCostCenterOperations();
  const { toast } = useToast();
  
  const handleAddCostCenter = () => {
    setSelectedCostCenter(null);
    setShowForm(true);
  };

  const handleEditCostCenter = (costCenter: any) => {
    setSelectedCostCenter(costCenter);
    setShowForm(true);
  };

  const handleToggleStatus = async (costCenter: any) => {
    try {
      await toggleCostCenterStatus(costCenter.id, costCenter.is_active);
      toast({
        title: "تم تحديث الحالة",
        description: `تم ${costCenter.is_active ? 'تعطيل' : 'تفعيل'} مركز التكلفة بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة مركز التكلفة",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">مراكز التكلفة</h2>
        </div>
        <Button onClick={handleAddCostCenter} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مركز تكلفة
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">
              {selectedCostCenter ? "تعديل مركز تكلفة" : "إضافة مركز تكلفة جديد"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CostCenterForm 
              costCenter={selectedCostCenter}
              onCancel={() => setShowForm(false)}
              onSuccess={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة مراكز التكلفة</CardTitle>
        </CardHeader>
        <CardContent>
          <CostCentersTable 
            costCenters={costCenters} 
            isLoading={isLoading} 
            onEdit={handleEditCostCenter}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى تغيير حالة مركز التكلفة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
