
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EmployeeScheduleField } from "../fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess?: () => void;
}

export function EditEmployeeDialog({ 
  isOpen, 
  onClose, 
  employee,
  onSuccess 
}: EditEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    employee_number: "",
    gender: "",
    schedule_id: "",
    status: ""
  });

  useEffect(() => {
    if (employee) {
      setEmployeeData({
        full_name: employee.full_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "",
        employee_number: employee.employee_number || "",
        gender: employee.gender || "",
        schedule_id: employee.schedule_id || "",
        status: employee.status || "active"
      });
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setEmployeeData((prev) => ({ ...prev, department: departmentId }));
  };

  const handleScheduleChange = (scheduleId: string) => {
    setEmployeeData((prev) => ({ ...prev, schedule_id: scheduleId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) {
      toast.error("معرف الموظف غير متوفر");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', employee.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast.success("تم تحديث بيانات الموظف بنجاح");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="full_name">اسم الموظف</Label>
              <Input
                id="full_name"
                name="full_name"
                value={employeeData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={employeeData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                value={employeeData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="position">المسمى الوظيفي</Label>
              <Input
                id="position"
                name="position"
                value={employeeData.position}
                onChange={handleInputChange}
              />
            </div>
            
            <OrganizationalUnitField
              value={employeeData.department}
              onChange={handleDepartmentChange}
            />
            
            <div>
              <Label htmlFor="employee_number">الرقم الوظيفي</Label>
              <Input
                id="employee_number"
                name="employee_number"
                value={employeeData.employee_number}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">الجنس</Label>
              <Select
                value={employeeData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">حالة الموظف</Label>
              <Select
                value={employeeData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="on_leave">في إجازة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <EmployeeScheduleField
              value={employeeData.schedule_id}
              onChange={handleScheduleChange}
            />
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={onClose}
              type="button"
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
