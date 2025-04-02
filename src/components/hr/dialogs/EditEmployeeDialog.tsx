
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EditEmployeeDialogProps {
  id?: string;
  employee: any;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function EditEmployeeDialog({ id, employee, isOpen, onClose, onSuccess }: EditEmployeeDialogProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      full_name: employee?.full_name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      department: employee?.department || '',
      hire_date: employee?.hire_date || '',
      employee_number: employee?.employee_number || '',
      contract_type: employee?.contract_type || '',
      contract_end_date: employee?.contract_end_date || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(data)
        .eq('id', employee.id);
      
      if (error) throw error;
      
      toast.success('تم تحديث بيانات الموظف بنجاح');
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  {...register('full_name', { required: 'الاسم مطلوب' })}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">المسمى الوظيفي</Label>
                  <Input
                    id="position"
                    {...register('position')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  <Input
                    id="department"
                    {...register('department')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date">تاريخ التعيين</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    {...register('hire_date')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_number">رقم الموظف</Label>
                  <Input
                    id="employee_number"
                    {...register('employee_number')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_type">نوع العقد</Label>
                  <Input
                    id="contract_type"
                    {...register('contract_type')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_end_date">تاريخ انتهاء العقد</Label>
                  <Input
                    id="contract_end_date"
                    type="date"
                    {...register('contract_end_date')}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
