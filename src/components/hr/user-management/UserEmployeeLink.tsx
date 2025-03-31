// src/components/hr/user-management/UserEmployeeLink.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserEmployeeLinkProps {
  employeeId: string;
  employeeName: string;
  currentUserId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEmployeeLink({ 
  employeeId, 
  employeeName, 
  currentUserId, 
  isOpen, 
  onClose, 
  onSuccess 
}: UserEmployeeLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string, email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId || "");
  
  // Fetch available users
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
        toast.error("حدث خطأ أثناء جلب بيانات المستخدمين");
      }
    };
    
    if (isOpen) {
      fetchUsers();
      setSelectedUserId(currentUserId || "");
    }
  }, [isOpen, currentUserId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Update employee with selected user_id (or null if none selected)
      const { error } = await supabase
        .from('employees')
        .update({ 
          user_id: selectedUserId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      toast.success(
        selectedUserId 
          ? "تم ربط الموظف بحساب المستخدم بنجاح" 
          : "تم إلغاء ربط الموظف بحساب المستخدم"
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error updating employee user link:', error);
      toast.error("حدث خطأ أثناء تحديث ربط الحساب");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>ربط الموظف بحساب مستخدم</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-sm">
            الموظف: <span className="font-semibold">{employeeName}</span>
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="user_id">اختر حساب المستخدم</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حساب المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون ربط</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              ربط الموظف بحساب مستخدم يتيح له استخدام ميزات التسجيل الذاتي للحضور والانصراف
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري التحديث..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
