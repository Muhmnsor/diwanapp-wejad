// src/components/hr/dialogs/AddEmployeeDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeDialog({ isOpen, onClose, onSuccess }: AddEmployeeDialogProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string, email: string }[]>([]);
  const [formData, setFormData] = useState({
    employee_number: "",
    full_name: "",
    position: "",
    department: "",
    hire_date: new Date().toISOString().split("T")[0],
    contract_type: "full_time",
    email: "",
    phone: "",
    user_id: "no_user"
  });
  
  // Fetch users for linking
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('auth_users_view')
          .select('id, email');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // If user is selected, auto-fill email if available
    if (name === 'user_id' && value) {
      const selectedUser = users.find(u => u.id === value);
      if (selectedUser && selectedUser.email && !formData.email) {
        setFormData(prev => ({ ...prev, email: selectedUser.email }));
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Insert new employee record
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...formData,
          user_id: formData.user_id === "no_user" ? null : formData.user_id,
          status: 'active'
        })
        .select();
        
      if (error) throw error;
      
      onSuccess();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("حدث خطأ أثناء إضافة الموظف");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_number">الرقم الوظيفي</Label>
              <Input
                id="employee_number"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleChange}
                placeholder="أدخل الرقم الوظيفي"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">الاسم الكامل</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">المنصب</Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="أدخل المنصب"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="أدخل القسم"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">تاريخ التعيين</Label>
              <Input
                id="hire_date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
                required
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
          </div>
          
          {/* User Linking Field */}
          <div className="space-y-2">
            <Label htmlFor="user_id">ربط بحساب مستخدم</Label>
            <Select 
              value={formData.user_id} 
              onValueChange={(value) => handleSelectChange("user_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حساب المستخدم (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_user">بدون ربط</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              ربط الموظف بحساب مستخدم يتيح له استخدام ميزات التسجيل الذاتي للحضور والانصراف
            </p>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

