
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditEmployeeDialogProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditEmployeeDialog({ employee, isOpen, onClose, onSuccess }: EditEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    employee_number: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    contract_type: "",
    hire_date: "",
    contract_end_date: "",
    status: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Set initial form data when employee changes
  useEffect(() => {
    if (employee) {
      // Format dates for input fields
      const formattedHireDate = employee.hire_date ? employee.hire_date.split('T')[0] : '';
      const formattedContractEndDate = employee.contract_end_date ? employee.contract_end_date.split('T')[0] : '';
      
      setFormData({
        full_name: employee.full_name || "",
        employee_number: employee.employee_number || "",
        position: employee.position || "",
        department: employee.department || "",
        email: employee.email || "",
        phone: employee.phone || "",
        contract_type: employee.contract_type || "",
        hire_date: formattedHireDate,
        contract_end_date: formattedContractEndDate,
        status: employee.status || "active",
      });
    }
  }, [employee]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', employee.id);
      
      if (error) throw error;
      
      toast.success("تم تحديث بيانات الموظف بنجاح");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee_number">الرقم الوظيفي</Label>
              <Input
                id="employee_number"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">المسمى الوظيفي</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_type">نوع العقد</Label>
              <Select
                value={formData.contract_type}
                onValueChange={(value) => handleSelectChange("contract_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">دوام كامل</SelectItem>
                  <SelectItem value="part_time">دوام جزئي</SelectItem>
                  <SelectItem value="contractor">متعاقد</SelectItem>
                  <SelectItem value="temporary">مؤقت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hire_date">تاريخ التعيين</Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contract_end_date">تاريخ انتهاء العقد</Label>
              <Input
                id="contract_end_date"
                name="contract_end_date"
                type="date"
                value={formData.contract_end_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">يعمل</SelectItem>
                  <SelectItem value="inactive">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
