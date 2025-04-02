
import { useState } from "react";
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

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddEmployeeDialog({ 
  isOpen, 
  onClose, 
  onSuccess 
}: AddEmployeeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    employee_number: "",
    gender: "",
    schedule_id: ""
  });

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
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast.success("تم إضافة الموظف بنجاح");
      if (onSuccess) onSuccess();
      onClose();
      setEmployeeData({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        employee_number: "",
        gender: "",
        schedule_id: ""
      });
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
