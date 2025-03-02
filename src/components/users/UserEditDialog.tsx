
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
  // تعيين الدور المحدد عند فتح نافذة التعديل
  useEffect(() => {
    if (user && roles.length > 0) {
      // البحث عن معرف الدور الذي يطابق اسم دور المستخدم
      const roleObj = roles.find(r => r.name === user.role);
      if (roleObj) {
        setSelectedRole(roleObj.id);
      } else if (roles.length > 0) {
        // إذا لم يتم العثور على الدور، استخدم أول دور متاح كافتراضي
        setSelectedRole(roles[0].id);
      }
    } else if (roles.length > 0) {
      // إذا لم يكن هناك مستخدم ولكن توجد أدوار، حدد الدور الأول كافتراضي
      setSelectedRole(roles[0].id);
    }
  }, [user, roles, setSelectedRole]);

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
