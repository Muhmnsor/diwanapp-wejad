
import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
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
  const [displayName, setDisplayName] = useState("");
  
  // تعيين الدور المحدد والمسمى الوظيفي عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      console.log("UserEditDialog - تحميل بيانات المستخدم:", user);
      
      // تعيين المسمى الوظيفي إذا كان موجودًا
      setDisplayName(user.displayName || "");
      
      if (user.role) {
        console.log("UserEditDialog - الدور الحالي للمستخدم:", user.role);
        
        // البحث عن معرف الدور الذي يطابق اسم دور المستخدم
        const roleObj = roles.find(r => r.name === user.role);
        if (roleObj) {
          console.log("UserEditDialog - تعيين الدور المحدد من بيانات المستخدم:", roleObj.id, roleObj.name);
          setSelectedRole(roleObj.id);
        } else {
          console.log("UserEditDialog - لم يتم العثور على الدور للمستخدم، تم مسح التحديد");
          setSelectedRole("");
        }
      } else {
        // إذا لم يكن هناك مستخدم أو لم يكن له دور، تعيين القيمة الافتراضية
        console.log("UserEditDialog - لا يوجد دور للمستخدم، تعيين القيمة الافتراضية");
        setSelectedRole("");
      }
    } else {
      // إذا لم يكن هناك مستخدم، إعادة تعيين القيم الافتراضية
      console.log("UserEditDialog - لا يوجد مستخدم، تعيين القيم الافتراضية");
      setSelectedRole("");
      setDisplayName("");
    }
  }, [user, roles, setSelectedRole]);

  console.log('UserEditDialog - الأدوار المتاحة:', roles);
  console.log('UserEditDialog - الدور المحدد:', selectedRole);
  console.log('UserEditDialog - المستخدم الحالي:', user);
  console.log('UserEditDialog - المسمى الوظيفي:', displayName);

  // وظيفة للحصول على اسم الدور المعروض بناءً على معرفه
  const getRoleDisplayName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'غير معروف';
  };

  // تعديل وظيفة التقديم لتشمل المسمى الوظيفي
  const handleSubmit = () => {
    console.log("UserEditDialog - تم النقر على زر التحديث");
    console.log("UserEditDialog - الدور المحدد عند التقديم:", selectedRole);
    console.log("UserEditDialog - المسمى الوظيفي عند التقديم:", displayName);
    
    // نمرر المسمى الوظيفي إلى العنصر الأب من خلال الاستفادة من التعديل في useUserOperations
    // (سيتم تعديل الوظيفة onSubmit في المكون الأب للتعامل مع المسمى الوظيفي)
    if (user) {
      user.displayName = displayName;
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
          <div className="space-y-2 text-right">
            <div className="font-medium">البريد الإلكتروني</div>
            <div>{user?.username}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">المسمى الوظيفي</div>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل المسمى الوظيفي"
              className="w-full text-right"
            />
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">الدور الحالي</div>
            <div className="text-muted-foreground">{user?.role || 'لم يتم تعيين دور'}</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="font-medium">الدور الجديد</div>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                console.log("UserEditDialog - تم اختيار الدور:", value, "- الاسم:", getRoleDisplayName(value));
                setSelectedRole(value);
              }}
            >
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
