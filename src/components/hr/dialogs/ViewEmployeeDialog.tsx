
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeContractsTabs } from "../contract-tabs/EmployeeContractsTabs";

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}

export function ViewEmployeeDialog({ isOpen, onClose, employee }: ViewEmployeeDialogProps) {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch employee contracts
  useEffect(() => {
    if (isOpen && employee?.id) {
      fetchEmployeeContracts(employee.id);
    }
  }, [isOpen, employee]);
  
  const fetchEmployeeContracts = async (employeeId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hr_employee_contracts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setContracts(data || []);
    } catch (error: any) {
      console.error('Error fetching employee contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContractUpdated = () => {
    if (employee?.id) {
      fetchEmployeeContracts(employee.id);
    }
  };
  
  if (!employee) return null;

  // Helper function to translate gender values
  const translateGender = (gender: string | null | undefined) => {
    if (!gender) return 'غير محدد';

    // Handle both English and Arabic gender values
    return gender === 'male' || gender === 'ذكر' ? 'ذكر' : 
           gender === 'female' || gender === 'أنثى' ? 'أنثى' : 
           'غير محدد';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">{employee.full_name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="border-b pb-2">
                <span className="font-medium">الاسم: </span>
                <span>{employee.full_name}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium">المسمى الوظيفي: </span>
                <span>{employee.position || 'غير محدد'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium">القسم: </span>
                <span>{employee.department || 'غير محدد'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium">الجنس: </span>
                <span>{translateGender(employee.gender)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="border-b pb-2">
                <span className="font-medium">البريد الإلكتروني: </span>
                <span>{employee.email || 'غير محدد'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium">رقم الهاتف: </span>
                <span>{employee.phone || 'غير محدد'}</span>
              </div>
              <div className="border-b pb-2">
                <span className="font-medium">تاريخ التعيين: </span>
                <span>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('ar-SA') : 'غير محدد'}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">إدارة العقود وحساب المستخدم</h3>
            {isLoading ? (
              <div className="text-center py-6">جاري التحميل...</div>
            ) : (
              <EmployeeContractsTabs
                employeeId={employee.id}
                employeeName={employee.full_name}
                contracts={contracts}
                currentUserId={employee.user_id}
                employee={employee}
                onContractUpdated={handleContractUpdated}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
