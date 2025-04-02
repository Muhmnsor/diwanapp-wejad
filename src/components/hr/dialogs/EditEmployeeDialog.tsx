
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateEmployee } from "@/hooks/hr/useEmployees";
import { toast } from "sonner";
import { EmployeeScheduleField } from "../fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";

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
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    employee_number: "",
    gender: "",
    schedule_id: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { updateEmployee } = useUpdateEmployee();

  // Update form data when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        department: employee.department || "",
        employee_number: employee.employee_number || "",
        gender: employee.gender || "",
        schedule_id: employee.schedule_id || ""
      });
    }
  }, [employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, schedule_id: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, department: value }));
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.position) {
      toast.error("الرجاء ملء الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      await updateEmployee(employee.id, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        employee_number: formData.employee_number,
        gender: formData.gender,
        schedule_id: formData.schedule_id || null
      });
      
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
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">الاسم الكامل *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="position">المسمى الوظيفي *</Label>
            <Input
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <OrganizationalUnitField 
            value={formData.department} 
            onChange={handleDepartmentChange} 
          />
          
          <div className="grid gap-2">
            <Label htmlFor="employee_number">الرقم الوظيفي</Label>
            <Input
              id="employee_number"
              name="employee_number"
              value={formData.employee_number}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="gender">الجنس</Label>
            <Input
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            />
          </div>
          
          <EmployeeScheduleField 
            value={formData.schedule_id} 
            onChange={handleScheduleChange} 
          />
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
