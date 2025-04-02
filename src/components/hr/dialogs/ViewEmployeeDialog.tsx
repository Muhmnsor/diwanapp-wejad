
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GenderField } from "@/components/hr/fields/GenderField";

interface Employee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  employee_number?: string;
  hire_date?: string;
  status?: string;
  contract_type?: string;
  gender?: string;
}

interface ViewEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export function ViewEmployeeDialog({
  isOpen,
  onClose,
  employee,
}: ViewEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4" dir="rtl">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-sm font-medium">الاسم:</span>
            <span className="col-span-3">{employee.full_name}</span>
          </div>
          
          {employee.position && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">المنصب:</span>
              <span className="col-span-3">{employee.position}</span>
            </div>
          )}
          
          {employee.department && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">القسم:</span>
              <span className="col-span-3">{employee.department}</span>
            </div>
          )}
          
          {employee.gender && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">الجنس:</span>
              <span className="col-span-3">
                {employee.gender === "male" ? "ذكر" : "أنثى"}
              </span>
            </div>
          )}
          
          {employee.email && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">البريد:</span>
              <span className="col-span-3" dir="ltr">
                {employee.email}
              </span>
            </div>
          )}
          
          {employee.phone && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">الهاتف:</span>
              <span className="col-span-3" dir="ltr">
                {employee.phone}
              </span>
            </div>
          )}
          
          {employee.employee_number && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">رقم الموظف:</span>
              <span className="col-span-3">{employee.employee_number}</span>
            </div>
          )}
          
          {employee.hire_date && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">تاريخ التعيين:</span>
              <span className="col-span-3">{employee.hire_date}</span>
            </div>
          )}
          
          {employee.status && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">الحالة:</span>
              <span className="col-span-3">
                {employee.status === "active" ? "نشط" : "غير نشط"}
              </span>
            </div>
          )}
          
          {employee.contract_type && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">نوع العقد:</span>
              <span className="col-span-3">{employee.contract_type}</span>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
