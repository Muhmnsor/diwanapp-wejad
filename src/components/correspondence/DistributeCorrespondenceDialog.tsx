import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { supabase } from "@/integrations/supabase/client";

interface DistributeCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface Department {
  id: string;
  name: string;
}

export const DistributeCorrespondenceDialog: React.FC<DistributeCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { distributeCorrespondence } = useCorrespondence();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
        
        // Get users list
        const { data, error } = await supabase
          .from('auth_users_view')
          .select('id, email, raw_user_meta_data');
          
        if (error) throw error;
        
        const formattedUsers = data?.map(user => ({
          id: user.id,
          display_name: user.raw_user_meta_data?.name || user.email,
          email: user.email
        })) || [];
        
        setUsers(formattedUsers);
        
        // Get departments (organizational units or another similar structure)
        // This is a placeholder, adjust according to your actual data structure
        const { data: deptData, error: deptError } = await supabase
          .from('organizational_units')
          .select('id, name')
          .eq('is_active', true);
          
        if (deptError) throw deptError;
        
        setDepartments(deptData || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل البيانات",
          description: "تعذر تحميل قائمة المستخدمين والأقسام"
        });
      }
    };
    
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      const distributedTo = formData.get('distributed_to') as string;
      const distributedToDept = formData.get('distributed_to_department') as string;
      const instructions = formData.get('instructions') as string;
      const responseDeadline = formData.get('response_deadline') as string;
      
      if (!userId) {
        throw new Error("لم يتم تحديد المستخدم الحالي");
      }
      
      const result = await distributeCorrespondence(
        correspondenceId,
        {
          distributed_to: distributedTo,
          distributed_by: userId,
          distributed_to_department: distributedToDept,
          instructions,
          response_deadline: responseDeadline || undefined
        }
      );
      
      if (!result.success) {
        throw new Error("فشل في توزيع المعاملة");
      }
      
      toast({
        title: "تم توزيع المعاملة بنجاح",
        description: "تم إرسال المعاملة إلى الجهة المحددة"
      });
      
      onClose();
    } catch (error) {
      console.error("Error distributing correspondence:", error);
      toast({
        variant: "destructive",
        title: "خطأ في توزيع المعاملة",
        description: String(error) || "حدث خطأ أثناء توزيع المعاملة، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>توزيع المعاملة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="distributed_to">توزيع إلى</Label>
            <Select name="distributed_to" required>
              <SelectTrigger id="distributed_to">
                <SelectValue placeholder="اختر موظف" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="distributed_to_department">القسم</Label>
            <Select name="distributed_to_department">
              <SelectTrigger id="distributed_to_department">
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="instructions">التعليمات</Label>
            <Textarea 
              id="instructions" 
              name="instructions" 
              placeholder="أدخل التعليمات الخاصة بهذه المعاملة" 
              rows={3} 
            />
          </div>
          
          <div>
            <Label htmlFor="response_deadline">الموعد النهائي للرد (اختياري)</Label>
            <Input id="response_deadline" name="response_deadline" type="date" />
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري التوزيع...' : 'توزيع المعاملة'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

