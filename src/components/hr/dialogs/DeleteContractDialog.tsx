
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { toast } from "sonner";

interface DeleteContractDialogProps {
  contract: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteContractDialog({ contract, isOpen, onClose, onSuccess }: DeleteContractDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteContract } = useEmployeeContracts(contract?.employee_id);
  
  const handleDelete = async () => {
    if (!contract?.id) return;
    
    setIsLoading(true);
    
    try {
      // Delete contract record
      await deleteContract(contract.id);
      
      toast.success("تم حذف العقد بنجاح");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      toast.error(error.message || "حدث خطأ أثناء حذف العقد");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا العقد؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف العقد بشكل نهائي. 
            هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
