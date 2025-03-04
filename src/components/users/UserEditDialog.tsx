
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { User, Role } from "./types";

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  roles: Role[];
}

export const UserEditDialog = ({
  user,
  isOpen,
  onClose,
  newPassword,
  setNewPassword,
  selectedRole,
  setSelectedRole,
  onSubmit,
  isSubmitting,
  roles,
}: UserEditDialogProps) => {
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (user) {
      // Set displayName from user object when user changes
      setDisplayName(user.displayName || "");
      
      // Find the role ID for the current user's role name
      if (roles && roles.length > 0) {
        const userRole = roles.find(r => r.name === user.role);
        if (userRole) {
          setSelectedRole(userRole.id);
        } else {
          // If no matching role is found, reset the selection
          setSelectedRole("");
        }
      }
    } else {
      setDisplayName("");
      setSelectedRole("");
    }
  }, [user, roles, setSelectedRole]);

  const handleSubmit = async () => {
    // Update the displayName in the user object
    if (user) {
      user.displayName = displayName;
    }
    await onSubmit();
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return "غير معروف";
    
    switch (role.name) {
      case 'admin': return 'مشرف';
      case 'event_creator': return 'منشئ فعاليات';
      case 'event_executor': return 'منفذ فعاليات';
      case 'event_media': return 'إعلامي';
      default: return role.name;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
          <DialogDescription className="text-right">
            يمكنك تعديل كلمة المرور ودور المستخدم
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-right">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={user.username} disabled dir="ltr" className="text-right" />
          </div>
          <div className="space-y-2">
            <Label>الاسم الشخصي</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="أدخل الاسم الشخصي"
              dir="rtl"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="اترك فارغًا إذا لم ترغب في التغيير"
              dir="ltr" 
              className="text-right"
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
                  <SelectValue placeholder="اختر الدور">
                    {selectedRole ? getRoleDisplayName(selectedRole) : "اختر الدور"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {getRoleDisplayName(role.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد أدوار متاحة</div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
