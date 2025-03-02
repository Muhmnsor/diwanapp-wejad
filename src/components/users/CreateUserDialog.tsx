
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

  // تحقق مما إذا كان الدور موجوداً حقاً في القائمة
  const validateRoleExists = (roleId: string) => {
    return roles.some(role => role.id === roleId);
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      toast.error("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    if (!selectedRole) {
      toast.error("الرجاء اختيار دور للمستخدم");
      return;
    }

    if (!validateRoleExists(selectedRole)) {
      console.error("CreateUserDialog - محاولة إضافة دور غير صالح:", selectedRole);
      toast.error("الدور المختار غير صالح، يرجى المحاولة مرة أخرى");
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

      // انتظار لضمان إنشاء السجل في جدول profiles
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // تعيين الدور للمستخدم باستخدام RPC
      console.log('تعيين الدور للمستخدم باستخدام assign_user_role...');
      console.log('معرّف المستخدم:', authUser.user.id);
      console.log('معرّف الدور المراد تعيينه:', selectedRole);
      
      // أولاً، تأكد من حذف أي أدوار سابقة
      const { error: deleteRoleError } = await supabase.rpc('delete_user_roles', {
        p_user_id: authUser.user.id
      });
      
      if (deleteRoleError) {
        console.error('خطأ في حذف الأدوار السابقة:', deleteRoleError);
        throw deleteRoleError;
      }
      
      console.log('تم حذف الأدوار السابقة (إن وجدت) بنجاح');
      
      // ثم قم بتعيين الدور الجديد
      const { error: roleError } = await supabase.rpc('assign_user_role', {
        p_user_id: authUser.user.id,
        p_role_id: selectedRole
      });

      if (roleError) {
        console.error('خطأ في تعيين الدور:', roleError);
        throw roleError;
      }
      
      console.log('تم تعيين الدور بنجاح للمستخدم:', authUser.user.id, 'الدور:', selectedRole);

      // التحقق من إضافة الدور
      const { data: userRoles, error: checkRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', authUser.user.id)
        .eq('role_id', selectedRole);
        
      console.log('التحقق من إضافة الدور:', userRoles);
      if (checkRoleError) {
        console.error('خطأ في التحقق من إضافة الدور:', checkRoleError);
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.error('لم يتم تعيين الدور بشكل صحيح رغم عدم وجود خطأ معروف');
        throw new Error('Role assignment verification failed');
      }

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
      onUserCreated(); // إعادة تحميل قائمة المستخدمين
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
