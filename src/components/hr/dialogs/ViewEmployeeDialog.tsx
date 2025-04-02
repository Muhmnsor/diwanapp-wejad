
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ViewEmployeeDialogProps {
  employeeId: string;
  trigger: React.ReactNode;
}

export function ViewEmployeeDialog({ employeeId, trigger }: ViewEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false);

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!open) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          hr_employee_contracts(*)
        `)
        .eq('id', employeeId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">جاري تحميل البيانات...</div>
        ) : employee ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">الاسم الكامل</div>
                <div className="font-medium">{employee.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">المسمى الوظيفي</div>
                <div className="font-medium">{employee.position}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">القسم</div>
                <div className="font-medium">{employee.department}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الحالة</div>
                <div className="font-medium">
                  {employee.status === 'active' ? 'يعمل' : 'منتهي'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">تاريخ التعيين</div>
                <div className="font-medium">
                  {employee.hire_date && new Date(employee.hire_date).toLocaleDateString('ar-SA')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
                <div className="font-medium">{employee.email || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">رقم الهاتف</div>
                <div className="font-medium">{employee.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">رقم الهوية</div>
                <div className="font-medium">{employee.id_number || '-'}</div>
              </div>
            </div>

            {employee.hr_employee_contracts && employee.hr_employee_contracts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">معلومات العقد</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">نوع العقد</div>
                    <div className="font-medium">
                      {employee.hr_employee_contracts[0].contract_type === 'permanent' ? 'دائم' : 
                       employee.hr_employee_contracts[0].contract_type === 'temporary' ? 'مؤقت' : 'متعاقد'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">تاريخ بداية العقد</div>
                    <div className="font-medium">
                      {employee.hr_employee_contracts[0].start_date && 
                        new Date(employee.hr_employee_contracts[0].start_date).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  {employee.hr_employee_contracts[0].end_date && (
                    <div>
                      <div className="text-sm text-muted-foreground">تاريخ نهاية العقد</div>
                      <div className="font-medium">
                        {new Date(employee.hr_employee_contracts[0].end_date).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  )}
                  {employee.hr_employee_contracts[0].probation_end_date && (
                    <div>
                      <div className="text-sm text-muted-foreground">نهاية الفترة التجريبية</div>
                      <div className="font-medium">
                        {new Date(employee.hr_employee_contracts[0].probation_end_date).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">لا توجد بيانات للموظف</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
