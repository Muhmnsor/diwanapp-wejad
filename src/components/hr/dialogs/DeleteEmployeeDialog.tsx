
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DeleteEmployeeDialogProps {
  id?: string;
  employee: any;
  employeeName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function DeleteEmployeeDialog({ 
  id, 
  employee, 
  employeeName, 
  isOpen, 
  onClose,
  onSuccess 
}: DeleteEmployeeDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!employee?.id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employee.id);
      
      if (error) throw error;
      
      toast.success('تم حذف الموظف بنجاح');
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف موظف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف الموظف{' '}
            <span className="font-bold">{employeeName || employee?.full_name}</span>؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
