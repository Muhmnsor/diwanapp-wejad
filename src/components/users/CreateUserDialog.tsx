
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
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  roles: Role[];
  onUserCreated?: () => void; // Add this prop to maintain compatibility
}

export const CreateUserDialog = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onSuccess,
  onUserCreated, // Accept the alternative prop name
  roles,
}: CreateUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle both controlled and uncontrolled modes
  const dialogOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const handleClose = externalOnClose || (() => setIsOpen(false));

  const resetForm = () => {
    setNewUsername("");
    setNewPassword("");
    setNewDisplayName("");
    setSelectedRole("");
  };

  const onDialogClose = () => {
    resetForm();
    handleClose();
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
      console.log("الاسم الشخصي:", newDisplayName || "غير محدد");
      console.log("الدور المحدد:", selectedRole);
      
      // 1. إنشاء المستخدم في نظام المصادقة
      const { data: userData, error: authError } = await supabase.auth.signUp({
        email: newUsername,
        password: newPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: newDisplayName || null
          }
        }
      });
      
      if (authError) {
        console.error("خطأ في إنشاء المستخدم:", authError);
        throw authError;
      }
      
      console.log("تم إنشاء المستخدم بنجاح:", userData.user.id);
      const userId = userData.user.id;
      
      // 2. تحديث الاسم الشخصي إذا تم إدخاله
      if (newDisplayName) {
        console.log("تحديث الاسم الشخصي...");
        const { error: displayNameError } = await supabase
          .from('profiles')
          .update({ display_name: newDisplayName })
          .eq('id', userId);
          
        if (displayNameError) {
          console.error("خطأ في تحديث الاسم الشخصي:", displayNameError);
          // لا نريد إلغاء العملية إذا فشل تحديث الاسم الشخصي
          console.warn("تم تجاوز خطأ تحديث الاسم الشخصي واستكمال العملية");
        } else {
          console.log("تم تحديث الاسم الشخصي بنجاح");
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
        details: `تم إنشاء المستخدم (البريد: ${newUsername}, الدور: ${selectedRole}, الاسم الشخصي: ${newDisplayName || 'غير محدد'})`
      });
      
      toast.success("تم إنشاء المستخدم بنجاح");
      onDialogClose();
      // Call both success callbacks for compatibility
      onSuccess();
      if (onUserCreated) onUserCreated();
      console.log("=== تمت عملية إنشاء المستخدم بنجاح ===");
    } catch (error) {
      console.error("خطأ عام في إنشاء المستخدم:", error);
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support for uncontrolled usage with a button
  if (externalIsOpen === undefined) {
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>إضافة مستخدم جديد</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                onClick={onDialogClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // For controlled usage (with isOpen and onClose provided)
  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogClose}>
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
            onClick={onDialogClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
