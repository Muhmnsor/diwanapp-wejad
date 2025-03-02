
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Role } from "./types";

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  selectedRole: string;
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
  // تعيين الدور المحدد عند تغيير المستخدم
  useEffect(() => {
    if (user && user.role && roles.length > 0) {
      console.log("UserEditDialog - تحميل بيانات المستخدم:", user);
      console.log("UserEditDialog - الدور الحالي للمستخدم:", user.role);
      console.log("UserEditDialog - الأدوار المتاحة:", roles.map(r => `${r.id}: ${r.name}`));
      
      // البحث عن معرف الدور الذي يطابق اسم دور المستخدم
      const roleObj = roles.find(r => r.name === user.role);
      if (roleObj) {
        console.log("UserEditDialog - تعيين الدور المحدد من بيانات المستخدم:", roleObj.id, roleObj.name);
        setSelectedRole(roleObj.id);
      } else {
        console.log("UserEditDialog - لم يتم العثور على الدور للمستخدم، تم مسح التحديد");
        // إذا كانت هناك أدوار متاحة، اختر الأول كافتراضي
        if (roles.length > 0) {
          console.log("UserEditDialog - تعيين الدور الافتراضي:", roles[0].id);
          setSelectedRole(roles[0].id);
        } else {
          setSelectedRole("");
        }
      }
    } else if (roles.length > 0) {
      // إذا لم يكن هناك مستخدم أو لم يكن له دور ولكن توجد أدوار متاحة، اختر الأول كافتراضي
      console.log("UserEditDialog - تعيين الدور الافتراضي (لا يوجد مستخدم أو دور):", roles[0].id);
      setSelectedRole(roles[0].id);
    } else {
      // إذا لم يكن هناك مستخدم ولا أدوار متاحة
      console.log("UserEditDialog - لا يوجد مستخدم أو أدوار متاحة");
      setSelectedRole("");
    }
  }, [user, roles, setSelectedRole]);

  console.log('UserEditDialog - الأدوار المتاحة:', roles.map(r => `${r.id}: ${r.name}`));
  console.log('UserEditDialog - الدور المحدد:', selectedRole);
  console.log('UserEditDialog - المستخدم الحالي:', user);

  // ترجمة اسم الدور للعربية
  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return roleName;
    }
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
          <div className="space-y-2 text-right">
            <div className="font-medium">البريد الإلكتروني</div>
            <div>{user?.username}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">الدور الحالي</div>
            <div className="text-muted-foreground">{user?.role ? getRoleDisplayName(user.role) : 'لم يتم تعيين دور'}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">الدور الجديد</div>
            {roles.length > 0 ? (
              <Select
                value={selectedRole || ''}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {getRoleDisplayName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد أدوار متاحة</div>
            )}
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">كلمة المرور الجديدة</div>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="اترك فارغاً إذا لم ترد التغيير"
              dir="ltr"
              className="w-full px-3 py-2 border rounded-md text-right"
            />
          </div>
        </div>
        <Button 
          onClick={onSubmit}
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري التحديث..." : "تحديث البيانات"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
