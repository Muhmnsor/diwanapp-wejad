
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCog } from "lucide-react";
import { User, Role } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserEditDialogProps {
  user: User;
  roles: Role[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  isSubmitting: boolean;
  onSave: () => void;
}

export const UserEditDialog = ({
  user,
  roles,
  isOpen,
  setIsOpen,
  newPassword,
  setNewPassword,
  selectedRole,
  setSelectedRole,
  isSubmitting,
  onSave,
}: UserEditDialogProps) => {
  // أضف السجلات لفهم ما يحدث
  console.info("UserEditDialog - الأدوار المتاحة:", roles);
  console.info("UserEditDialog - الدور المحدد حالياً:", selectedRole);
  console.info("UserEditDialog - المستخدم الحالي:", user);

  // تأكد من تعيين الدور الافتراضي عند فتح الحوار
  useEffect(() => {
    if (isOpen && user) {
      // إذا كان للمستخدم دور محدد، قم بتعيينه كافتراضي، وإلا حدد الدور الأول
      if (user.roleId) {
        setSelectedRole(user.roleId);
      } else if (roles && roles.length > 0) {
        console.info("UserEditDialog - المستخدم ليس لديه دور، تعيين أول دور متاح:", roles[0].id);
        setSelectedRole(roles[0].id);
      } else {
        console.info("UserEditDialog - لا يوجد مستخدم أو الحوار مغلق، تعيين القيمة الافتراضية");
        setSelectedRole("");
      }
    }
  }, [isOpen, user, roles, setSelectedRole]);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="تعديل المستخدم">
          <UserCog className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={user?.username || ""} disabled className="text-right" />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في تغييرها)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              className="text-right"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>الدور</Label>
            {roles && roles.length > 0 ? (
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
                dir="rtl"
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
        </div>
        <Button 
          onClick={onSave} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
