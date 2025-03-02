
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserFormFields } from "./UserFormFields";
import { Role } from "./types";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roles: Role[];
}

export const CreateUserDialog = ({
  isOpen,
  onClose,
  onSuccess,
  roles,
}: CreateUserDialogProps) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setNewUsername("");
    setNewPassword("");
    setNewDisplayName("");
    setSelectedRole("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newPassword || !selectedRole) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("=== بدء عملية إنشاء مستخدم جديد ===");
      console.log("البريد الإلكتروني:", newUsername);
      console.log("المسمى الوظيفي:", newDisplayName || "غير محدد");
      console.log("الدور المحدد:", selectedRole);
      
      // 1. إنشاء المستخدم في نظام المصادقة
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUsername,
        password: newPassword,
        email_confirm: true,
      });
      
      if (authError) {
        console.error("خطأ في إنشاء المستخدم:", authError);
        throw authError;
      }
      
      console.log("تم إنشاء المستخدم بنجاح:", authData.user.id);
      const userId = authData.user.id;
      
      // 2. تحديث المسمى الوظيفي إذا تم إدخاله
      if (newDisplayName) {
        console.log("تحديث المسمى الوظيفي...");
        const { error: displayNameError } = await supabase
          .from('profiles')
          .update({ display_name: newDisplayName })
          .eq('id', userId);
          
        if (displayNameError) {
          console.error("خطأ في تحديث المسمى الوظيفي:", displayNameError);
          // لا نريد إلغاء العملية إذا فشل تحديث المسمى الوظيفي
          console.warn("تم تجاوز خطأ تحديث المسمى الوظيفي واستكمال العملية");
        } else {
          console.log("تم تحديث المسمى الوظيفي بنجاح");
        }
      }
      
      // 3. تعيين دور للمستخدم
      console.log("تعيين دور للمستخدم...");
      const { error: roleError } = await supabase.rpc('assign_user_role', {
        p_user_id: userId,
        p_role_id: selectedRole,
      });
      
      if (roleError) {
        console.error("خطأ في تعيين الدور:", roleError);
        throw roleError;
      }
      
      console.log("تم تعيين الدور بنجاح");
      
      // 4. تسجيل نشاط إنشاء المستخدم
      await supabase.rpc('log_user_activity', {
        user_id: userId,
        activity_type: 'user_created',
        details: `تم إنشاء المستخدم (البريد: ${newUsername}, الدور: ${selectedRole}, المسمى الوظيفي: ${newDisplayName || 'غير محدد'})`
      });
      
      toast.success("تم إنشاء المستخدم بنجاح");
      handleClose();
      onSuccess();
      console.log("=== تمت عملية إنشاء المستخدم بنجاح ===");
    } catch (error) {
      console.error("خطأ عام في إنشاء المستخدم:", error);
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          <DialogDescription className="text-right">
            أدخل معلومات المستخدم الجديد. سيتمكن المستخدم من تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور.
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
          newDisplayName={newDisplayName}
          setNewDisplayName={setNewDisplayName}
        />
        
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button 
            onClick={handleCreateUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جارِ الإنشاء..." : "إنشاء المستخدم"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
