
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onUserCreated: () => void;
}

export const AddUserDialog = ({ open, onOpenChange, roles, onUserCreated }: AddUserDialogProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setDisplayName("");
    setSelectedRole("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreateUser = async () => {
    if (!username || !password || !selectedRole) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: username,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // Add user to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username,
          display_name: displayName || username,
          last_login: null,
          is_active: true
        });

      if (profileError) throw profileError;

      // Assign role to user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: selectedRole
        });

      if (roleError) throw roleError;

      toast.success("تم إنشاء المستخدم بنجاح");
      handleClose();
      onUserCreated();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("حدث خطأ أثناء إنشاء المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 text-right">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              dir="ltr"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
              className="text-right"
            />
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
            <Label>الدور</Label>
            {roles && roles.length > 0 ? (
              <Select value={selectedRole} onValueChange={setSelectedRole} dir="rtl">
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
            ) : (
              <div className="text-sm text-muted-foreground">لا توجد أدوار متاحة</div>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button onClick={handleCreateUser} disabled={isSubmitting}>
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
