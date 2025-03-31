
// src/components/hr/user-management/UserEmployeeLink.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserEmployeeLink } from "@/components/hr/useUserEmployeeLink";

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
  const { linkUserToEmployee, isLoading: isLinking } = useUserEmployeeLink();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string, email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId || "no_user");
  
  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_app_users');
          
        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error("حدث خطأ أثناء جلب بيانات المستخدمين");
      }
    };
    
    if (isOpen) {
      fetchUsers();
      setSelectedUserId(currentUserId || "no_user");
    }
  }, [isOpen, currentUserId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (selectedUserId === "no_user") {
        // Update employee with null user_id
        const { error } = await supabase
          .from('employees')
          .update({ 
            user_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', employeeId);
          
        if (error) throw error;
        
        toast.success("تم إلغاء ربط الموظف بحساب المستخدم");
      } else {
        // Use the linkUserToEmployee function from the hook
        const result = await linkUserToEmployee(employeeId, selectedUserId);
        
        if (!result.success) {
          if (result.alreadyLinked) {
            throw new Error(`هذا المستخدم مرتبط بالفعل بموظف آخر`);
          } else {
            throw new Error(result.error?.message || "حدث خطأ أثناء ربط المستخدم بالموظف");
          }
        }
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error updating employee user link:', error);
      toast.error(error.message || "حدث خطأ أثناء تحديث ربط الحساب");
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
                <SelectItem value="no_user">بدون ربط</SelectItem>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isLinking}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading || isLinking}>
              {isLoading || isLinking ? "جاري التحديث..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
