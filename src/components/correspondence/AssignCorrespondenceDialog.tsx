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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, UserCheck } from "lucide-react";
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

interface AssignCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId: string;
  correspondenceNumber: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

export const AssignCorrespondenceDialog: React.FC<AssignCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { toast } = useToast();
  const { assignCorrespondence } = useCorrespondence();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // الحصول على قائمة المستخدمين
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
      } catch (err) {
        console.error("Error fetching users:", err);
        toast({
          variant: "destructive",
          title: "خطأ في تحميل البيانات",
          description: "تعذر تحميل قائمة المستخدمين"
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
      if (!userId) {
        throw new Error("يجب اختيار مستخدم للتعيين");
      }
      
      const result = await assignCorrespondence(correspondenceId, userId, notes);
      
      if (!result.success) {
        throw new Error("فشل في تعيين المعاملة");
      }
      
      toast({
        title: "تم تعيين المعاملة بنجاح",
        description: `تم تعيين المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (error) {
      console.error("Error assigning correspondence:", error);
      toast({
        variant: "destructive",
        title: "خطأ في تعيين المعاملة",
        description: String(error) || "حدث خطأ أثناء تعيين المعاملة، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            تعيين المعاملة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="correspondence-number">رقم المعاملة</Label>
            <Input 
              id="correspondence-number" 
              value={correspondenceNumber} 
              disabled 
            />
          </div>
          
          <div>
            <Label htmlFor="user_id">تعيين إلى</Label>
            <Select 
              value={userId} 
              onValueChange={setUserId}
              required
            >
              <SelectTrigger id="user_id">
                <SelectValue placeholder="اختر مستخدم" />
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
            <Label htmlFor="notes">ملاحظات التعيين</Label>
            <Textarea 
              id="notes" 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أدخل أي ملاحظات خاصة بالتعيين"
              rows={3}
            />
          </div>
          
          <div className="p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-800">
            <div className="flex gap-1 items-center">
              <Calendar className="h-4 w-4 text-blue-500" />
              <p>سيتم تسجيل تاريخ التعيين تلقائيًا</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري التعيين...' : 'تعيين المعاملة'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

