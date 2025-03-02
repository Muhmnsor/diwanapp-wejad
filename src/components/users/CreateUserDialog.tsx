
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
      console.log('معرف الدور المحدد:', selectedRole);
      console.log('تم إدخال كلمة مرور:', newPassword ? 'نعم' : 'لا');
      
      // استخدام وظيفة Edge Function لإنشاء مستخدم مع دور
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          operation: 'create_user_with_role',
          email: newUsername,
          password: newPassword,
          roleId: selectedRole
        }
      });

      if (error) {
        console.error('خطأ في إنشاء المستخدم:', error);
        throw error;
      }

      console.log('استجابة إنشاء المستخدم:', data);
      
      if (data && data.user && data.user.id) {
        console.log('تم إنشاء المستخدم بنجاح:', data.user.id);
        
        // تسجيل النشاط
        await supabase.rpc('log_user_activity', {
          user_id: data.user.id,
          activity_type: 'user_created',
          details: `تم إنشاء المستخدم مع دور: ${selectedRole}`
        });
        console.log('تم تسجيل نشاط إنشاء المستخدم');
      } else {
        console.error('تم إرجاع بيانات غير متوقعة:', data);
      }

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
