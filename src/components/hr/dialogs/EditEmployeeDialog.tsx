
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export interface EditEmployeeDialogProps {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeDialog({ 
  employee, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditEmployeeDialogProps) {
  const [formData, setFormData] = useState({
    full_name: employee?.full_name || "",
    position: employee?.position || "",
    department: employee?.department || "",
    status: employee?.status || "active",
    hire_date: employee?.hire_date || "",
    contract_end_date: employee?.contract_end_date || "",
    phone: employee?.phone || "",
    email: employee?.email || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.position || !formData.department) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("employees")
        .update(formData)
        .eq("id", employee.id);

      if (error) throw error;

      toast.success("تم تحديث بيانات الموظف بنجاح");
      onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الموظف</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل *</Label>
            <Input
              id="name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">المسمى الوظيفي *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">القسم *</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر حالة الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">يعمل</SelectItem>
                <SelectItem value="inactive">منتهي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hire_date">تاريخ التعيين</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date ? formData.hire_date.split('T')[0] : ''}
              onChange={(e) => handleChange("hire_date", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contract_end_date">تاريخ انتهاء العقد</Label>
            <Input
              id="contract_end_date"
              type="date"
              value={formData.contract_end_date ? formData.contract_end_date.split('T')[0] : ''}
              onChange={(e) => handleChange("contract_end_date", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
