
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
}

interface DeleteEmployeeDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteEmployeeDialog({ employee, isOpen, onClose, onSuccess }: DeleteEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Delete employee record
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);
        
      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error("حدث خطأ أثناء حذف الموظف");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف هذا الموظف؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف سجل الموظف "{employee.full_name}" بشكل نهائي. 
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
