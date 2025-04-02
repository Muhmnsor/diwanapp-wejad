
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEmployeeContracts, EmployeeContract } from '@/hooks/hr/useEmployeeContracts';

interface ContractDialogProps {
  employeeId: string;
  contract?: Partial<EmployeeContract>;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
}

export function ContractDialog({ 
  employeeId, 
  contract, 
  isOpen, 
  onClose, 
  mode = 'add' 
}: ContractDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { createContract, updateContract, uploadContractDocument } = useEmployeeContracts(employeeId);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      contract_type: contract?.contract_type || 'permanent',
      start_date: contract?.start_date || new Date().toISOString().split('T')[0],
      end_date: contract?.end_date || '',
      probation_end_date: contract?.probation_end_date || '',
      salary: contract?.salary || 0,
      status: contract?.status || 'active',
      notes: contract?.notes || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (mode === 'add') {
        await createContract({
          ...data,
          employee_id: employeeId,
        });
        toast.success('تم إضافة العقد بنجاح');
      } else {
        await updateContract({
          ...data,
          id: contract?.id!,
        });
        toast.success('تم تحديث العقد بنجاح');
      }
      onClose();
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const contractId = contract?.id || 'temp';
      const url = await uploadContractDocument(file, contractId);
      if (url) {
        toast.success('تم رفع الملف بنجاح');
      }
    } catch (error) {
      toast.error('فشل في رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'إضافة عقد جديد' : 'تعديل العقد'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'أدخل بيانات العقد الجديد للموظف' 
              : 'تعديل بيانات العقد الحالي'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contract_type">نوع العقد</Label>
              <Select 
                defaultValue={contract?.contract_type || 'permanent'}
              >
                <SelectTrigger id="contract_type">
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">دائم</SelectItem>
                  <SelectItem value="temporary">مؤقت</SelectItem>
                  <SelectItem value="contract">تعاقد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البدء</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date', { required: true })}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500">هذا الحقل مطلوب</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ الانتهاء</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="probation_end_date">تاريخ انتهاء فترة التجربة</Label>
                <Input
                  id="probation_end_date"
                  type="date"
                  {...register('probation_end_date')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">الراتب</Label>
                <Input
                  id="salary"
                  type="number"
                  {...register('salary', { min: 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select 
                defaultValue={contract?.status || 'active'}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر حالة العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ساري</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="terminated">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                rows={3}
                {...register('notes')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">رفع ملف العقد</Label>
              <Input
                id="document"
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-sm text-blue-500">جاري رفع الملف...</p>
              )}
              {contract?.document_url && (
                <div className="text-sm">
                  <a 
                    href={contract.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الملف الحالي
                  </a>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
