
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  email?: string;
  position?: string;
  department?: string;
  joining_date?: string;
  phone?: string;
  schedule_id?: string;
  status?: string;
}

interface ViewEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">الاسم الكامل</span>
            <span className="font-semibold">{employee.full_name}</span>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">الرقم الوظيفي</span>
            <span>{employee.employee_number}</span>
          </div>
          
          {employee.position && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">المنصب</span>
              <span>{employee.position}</span>
            </div>
          )}
          
          {employee.department && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">القسم</span>
              <span>{employee.department}</span>
            </div>
          )}
          
          {employee.email && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</span>
              <span dir="ltr" className="text-right">{employee.email}</span>
            </div>
          )}
          
          {employee.phone && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">رقم الهاتف</span>
              <span dir="ltr" className="text-right">{employee.phone}</span>
            </div>
          )}
          
          {employee.joining_date && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">تاريخ التعيين</span>
              <span>{new Date(employee.joining_date).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
          
          {employee.status && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">الحالة</span>
              <div>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
