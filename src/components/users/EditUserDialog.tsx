
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserEdited: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onUserEdited }: EditUserDialogProps) => {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch roles when dialog opens
    if (open) {
      fetchRoles();
    }
  }, [open]);

  useEffect(() => {
    // Reset form when user changes
    if (user) {
      setDisplayName(user.displayName || "");
      setPassword("");
      setIsActive(user.isActive !== false);
      
      // Fetch the user's current role
      if (user.id) {
        fetchUserRole(user.id);
      }
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name');
      
      if (error) throw error;
      
      setRoles(data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("حدث خطأ أثناء جلب الأدوار");
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedRole(data.role_id);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleClose = () => {
    setPassword("");
    onOpenChange(false);
  };

  const handleUpdateUser = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update password if provided
      if (password) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password }
        );

        if (authError) throw authError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          is_active: isActive 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      if (selectedRole) {
        // First delete existing roles
        const { error: deleteRoleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);
        
        if (deleteRoleError) throw deleteRoleError;

        // Add new role
        const { error: addRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role_id: selectedRole
          });
        
        if (addRoleError) throw addRoleError;
      }

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      handleClose();
      onUserEdited();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="اترك فارغًا إذا لم ترغب في التغيير"
              dir="ltr"
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
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={isActive ? "active" : "inactive"} onValueChange={(value) => setIsActive(value === "active")} dir="rtl">
              <SelectTrigger className="w-full text-right">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button onClick={handleUpdateUser} disabled={isSubmitting}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ التغييرات"}
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
