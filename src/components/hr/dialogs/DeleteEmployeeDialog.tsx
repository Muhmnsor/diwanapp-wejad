
import { useState } from "react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
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
      
      toast.success("تم حذف الموظف بنجاح");
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
    <DeleteDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="هل أنت متأكد من حذف هذا الموظف؟"
      description={`سيتم حذف سجل الموظف "${employee.full_name}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.`}
      onDelete={handleDelete}
      isDeleting={isLoading}
    />
  );
}
