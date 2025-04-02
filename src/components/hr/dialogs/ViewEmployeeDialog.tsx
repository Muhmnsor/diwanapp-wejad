
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface ViewEmployeeDialogProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, isOpen, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ar-SA");
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>بيانات الموظف: {employee.full_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">الاسم الكامل</p>
            <p>{employee.full_name}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">المسمى الوظيفي</p>
            <p>{employee.position}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">القسم</p>
            <p>{employee.department}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">الحالة</p>
            <Badge
              variant={employee.status === "active" ? "outline" : "secondary"}
              className={
                employee.status === "active"
                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
              }
            >
              {employee.status === "active" ? "يعمل" : "منتهي"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">تاريخ التعيين</p>
            <p>{formatDate(employee.hire_date)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">تاريخ انتهاء العقد</p>
            <p>{employee.contract_end_date ? formatDate(employee.contract_end_date) : "غير محدد"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
            <p>{employee.phone || "غير متوفر"}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
            <p>{employee.email || "غير متوفر"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
