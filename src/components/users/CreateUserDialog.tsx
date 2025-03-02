
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Role } from "./types";
import { UserFormFields } from "./UserFormFields";

interface CreateUserDialogProps {
  roles: Role[];
  onUserCreated: () => void;
}

export const CreateUserDialog = ({ roles, onUserCreated }: CreateUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!newUsername || !newPassword || !selectedRole) {
      toast.error("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('=== بدء عملية إنشاء مستخدم جديد ===');
      console.log('البريد الإلكتروني:', newUsername);
      console.log('الدور المحدد:', selectedRole);
      console.log('تم إدخال كلمة مرور:', newPassword ? 'نعم' : 'لا');
      
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: newUsername,
        password: newPassword,
      });

      if (signUpError) {
        console.error('خطأ في إنشاء المستخدم:', signUpError);
        throw signUpError;
      }

      if (!authUser.user) {
        console.error('لم يتم إرجاع بيانات المستخدم');
        throw new Error('No user data returned');
      }

      console.log('تم إنشاء المستخدم بنجاح:', authUser.user.id);

      // حذف أي أدوار سابقة (للتأكد)
      console.log('حذف أي أدوار سابقة للمستخدم...');
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', authUser.user.id);
        
      // انتظار لضمان معالجة عملية الحذف
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('محاولة إضافة الدور للمستخدم الجديد...');
      const { error: roleError, data: roleData } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role_id: selectedRole
        })
        .select();
      
      if (roleError) {
        console.error('خطأ في تعيين الدور:', roleError);
        throw roleError;
      }
      
      console.log('تم تعيين الدور بنجاح:', roleData);

      // تسجيل النشاط
      await supabase.rpc('log_user_activity', {
        user_id: authUser.user.id,
        activity_type: 'user_created',
        details: `تم إنشاء المستخدم مع دور: ${selectedRole}`
      });
      console.log('تم تسجيل نشاط إنشاء المستخدم');

      toast.success("تم إضافة المستخدم بنجاح");
      setIsOpen(false);
      setNewUsername("");
      setNewPassword("");
      setSelectedRole("");
      onUserCreated();
      console.log('=== انتهت عملية إنشاء المستخدم بنجاح ===');
    } catch (error) {
      console.error('خطأ عام في إضافة المستخدم:', error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2" />
          إضافة مستخدم
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          <DialogDescription className="text-right">
            قم بإدخال بيانات المستخدم الجديد وتحديد دوره في النظام
          </DialogDescription>
        </DialogHeader>
        <UserFormFields
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          roles={roles}
        />
        <Button 
          onClick={handleAddUser} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الإضافة..." : "إضافة المستخدم"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
