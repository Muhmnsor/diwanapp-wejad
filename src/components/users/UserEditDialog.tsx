
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Role } from "./types";
import { RoleSelector } from "./dialog/RoleSelector";
import { UserInfoDisplay } from "./dialog/UserInfoDisplay";
import { PasswordInput } from "./dialog/PasswordInput";

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  selectedRole: string | null;
  setSelectedRole: (role: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  roles: Role[];
}

export const UserEditDialog = ({
  user,
  isOpen,
  onClose,
  selectedRole,
  setSelectedRole,
  newPassword,
  setNewPassword,
  onSubmit,
  isSubmitting,
  roles = []
}: UserEditDialogProps) => {
  // تهيئة الدور المحدد عند فتح نافذة التعديل
  useEffect(() => {
    if (user && roles.length > 0) {
      console.log('تهيئة مربع الحوار لتعديل المستخدم:', user.username);
      console.log('أدوار المستخدم المتاحة:', roles);
      console.log('دور المستخدم الحالي:', user.role);

      if (user.role === 'لم يتم تعيين دور' || !user.role) {
        // إذا لم يكن للمستخدم دور محدد، نضبط القيمة إلى القيمة الخاصة بإزالة الدور
        console.log('المستخدم ليس له دور محدد، تعيين selectedRole للقيمة الخاصة بإزالة الدور');
        setSelectedRole('remove_role');
      } else {
        // البحث عن معرف الدور الذي يطابق اسم دور المستخدم
        const roleObj = roles.find(r => r.name === user.role);
        if (roleObj) {
          console.log('تم العثور على الدور المطابق:', roleObj);
          setSelectedRole(roleObj.id);
          console.log('تم تعيين الدور المحدد إلى:', roleObj.id);
        } else {
          // إذا لم يتم العثور على الدور، نستخدم القيمة الخاصة بإزالة الدور
          console.log('لم يتم العثور على الدور المطابق، تعيين قيمة إزالة الدور');
          setSelectedRole('remove_role');
        }
      }
    } else if (roles.length > 0) {
      // إذا لم يكن هناك مستخدم محدد، ولكن توجد أدوار، نستخدم الدور الأول كافتراضي
      console.log('لا يوجد مستخدم محدد، تعيين الدور الافتراضي الأول:', roles[0].id);
      setSelectedRole(roles[0].id);
    } else {
      // إذا لم يكن هناك أدوار متاحة، نستخدم القيمة الخاصة بإزالة الدور
      setSelectedRole('remove_role');
      console.log('لا توجد أدوار متاحة، تعيين قيمة إزالة الدور');
    }
  }, [user, roles, setSelectedRole]);

  // إضافة سجل للتحقق من الدور المحدد قبل الإرسال
  const handleSubmit = () => {
    console.log('التحقق من الدور المحدد قبل الإرسال:', selectedRole);
    
    // تسجيل معلومات المستخدم والأدوار المتاحة للتحقق
    console.log('معلومات المستخدم عند الإرسال:', user);
    console.log('الأدوار المتاحة عند الإرسال:', roles);
    
    // البحث عن الدور المحدد وعرض معلوماته قبل الإرسال
    if (selectedRole && selectedRole !== 'remove_role') {
      const selectedRoleObj = roles.find(r => r.id === selectedRole);
      console.log('الدور المحدد قبل الإرسال:', selectedRoleObj);
    } else {
      console.log('تم تحديد إزالة الدور قبل الإرسال');
    }
    
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription className="text-right">
            قم بتعديل البيانات المطلوبة ثم اضغط على زر التحديث
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <UserInfoDisplay user={user} />
          <RoleSelector 
            roles={roles} 
            selectedRole={selectedRole} 
            onRoleChange={setSelectedRole} 
          />
          <PasswordInput 
            newPassword={newPassword} 
            setNewPassword={setNewPassword} 
          />
        </div>
        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري التحديث..." : "تحديث البيانات"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
