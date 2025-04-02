
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  full_name: string;
  employee_number: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hire_date: string;
  status: string;
}

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export function ViewEmployeeDialog({ isOpen, onClose, employee }: ViewEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      setLoading(true);
      const fetchEmployeeDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employee.id)
            .single();

          if (error) throw error;
          
          setEmployeeDetails(data);
        } catch (error) {
          console.error('Error fetching employee details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeDetails();
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">معلومات الموظف</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-4">جاري التحميل...</div>
        ) : employeeDetails ? (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-semibold">{employeeDetails.full_name}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">الرقم الوظيفي</p>
                <p>{employeeDetails.employee_number || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">المسمى الوظيفي</p>
                <p>{employeeDetails.position || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">القسم</p>
                <p>{employeeDetails.department || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p>{employeeDetails.email || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <p>{employeeDetails.phone || '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">تاريخ التعيين</p>
                <p>{employeeDetails.hire_date ? new Date(employeeDetails.hire_date).toLocaleDateString('ar-SA') : '-'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    employeeDetails.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employeeDetails.status === 'active' ? 'يعمل' : 'منتهي'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">لا توجد بيانات متاحة</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
