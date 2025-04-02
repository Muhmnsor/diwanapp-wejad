
import { useState } from "react";
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
import { useAddEmployee } from "@/hooks/hr/useEmployees";
import { toast } from "sonner";
import { EmployeeScheduleField } from "../fields/EmployeeScheduleField";
import { OrganizationalUnitField } from "../fields/OrganizationalUnitField";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EmployeeFormData {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;  // This will now be the organizational unit ID
  employee_number?: string;
  gender?: string;
  schedule_id?: string;
}

export function AddEmployeeDialog({ isOpen, onClose, onSuccess }: AddEmployeeDialogProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",  // Initialize as empty string
    employee_number: "",
    gender: "",
    schedule_id: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { addEmployee } = useAddEmployee();

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
    if (!formData.full_name || !formData.email || !formData.position) {
      toast.error("الرجاء ملء الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      await addEmployee({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,  // This now contains the organizational unit ID
        employee_number: formData.employee_number,
        gender: formData.gender,
        schedule_id: formData.schedule_id || null
      });
      
      toast.success("تمت إضافة الموظف بنجاح");
      
      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        employee_number: "",
        gender: "",
        schedule_id: ""
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
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
            <Label htmlFor="email">البريد الإلكتروني *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
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
            {isLoading ? "جاري الإضافة..." : "إضافة"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
