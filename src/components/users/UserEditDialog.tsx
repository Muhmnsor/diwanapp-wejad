
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
  // Set the selected role when user changes
  useEffect(() => {
    if (user && user.role) {
      // Find role ID that matches user's role name
      const roleObj = roles.find(r => r.name === user.role);
      if (roleObj) {
        console.log("Setting selected role from user data:", roleObj.id, roleObj.name);
        setSelectedRole(roleObj.id);
      } else {
        console.log("Role not found for user, clearing selection");
        setSelectedRole("");
      }
    }
  }, [user, roles, setSelectedRole]);

  console.log('Current roles:', roles);
  console.log('Selected role:', selectedRole);
  console.log('Current user:', user);

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
            <div className="font-medium">الدور</div>
            <Select
              value={selectedRole}
              onValueChange={(value) => {
                console.log("Role selected:", value);
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
