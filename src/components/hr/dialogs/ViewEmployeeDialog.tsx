
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmployeeScheduleField } from "../employees/EmployeeScheduleField";

interface ViewEmployeeDialogProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;
  
  // Format the hire date
  const formattedHireDate = employee.hire_date 
    ? new Date(employee.hire_date).toLocaleDateString("ar-SA") 
    : "غير محدد";
  
  // Format contract end date if available
  const formattedContractEndDate = employee.contract_end_date 
    ? new Date(employee.contract_end_date).toLocaleDateString("ar-SA") 
    : "غير محدد";
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>معلومات الموظف</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">{employee.full_name}</h3>
            <Badge variant={employee.status === "active" ? "outline" : "secondary"} className={employee.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}>
              {employee.status === "active" ? "يعمل" : "منتهي"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">الرقم الوظيفي</p>
              <p>{employee.employee_number || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">المسمى الوظيفي</p>
              <p>{employee.position || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">القسم</p>
              <p>{employee.department || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">تاريخ التعيين</p>
              <p>{formattedHireDate}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
              <p className="truncate">{employee.email || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
              <p>{employee.phone || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">نوع العقد</p>
              <p>{employee.contract_type === "full_time" ? "دوام كامل" : employee.contract_type === "part_time" ? "دوام جزئي" : employee.contract_type || "غير محدد"}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">تاريخ انتهاء العقد</p>
              <p>{formattedContractEndDate}</p>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <EmployeeScheduleField
              employeeId={employee?.id}
              scheduleId={employee?.schedule_id || ""}
              onScheduleChange={() => {}}
              isReadOnly={true}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
