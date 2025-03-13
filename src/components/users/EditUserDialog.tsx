
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Role } from "./types";
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when dialog opens or closes
    setError(null);
    
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
      setSelectedRole(""); // Reset initially, will be set by fetchUserRole if successful
      
      // Fetch the user's current role if user ID exists
      if (user.id) {
        fetchUserRole(user.id);
      }
    }
  }, [user]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description');
      
      if (error) throw error;
      
      console.log("Fetched roles:", data);
      setRoles(data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("حدث خطأ أثناء جلب الأدوار");
      toast.error("حدث خطأ أثناء جلب الأدوار");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .single();
      
      console.log("User role fetched:", data);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error for no rows returned
        throw error;
      }
      
      if (data && data.role_id) {
        setSelectedRole(data.role_id);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Don't show a toast for this error as it's not critical
      setError("حدث خطأ أثناء جلب دور المستخدم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onOpenChange(false);
  };

  const handleUpdateUser = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Updating user with id:", user.id);
      console.log("Current form state:", { displayName, isActive, selectedRole });
      
      // Update password if provided
      if (password) {
        console.log("Updating password...");
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password }
        );

        if (authError) throw authError;
      }

      // Update profile
      console.log("Updating profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
          is_active: isActive 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if provided
      if (selectedRole) {
        console.log("Updating role to:", selectedRole);
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
    } catch (error: any) {
      console.error("Error updating user:", error);
      setError(`حدث خطأ أثناء تحديث بيانات المستخدم: ${error.message || error}`);
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4 text-right">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="py-8 text-center">جارِ التحميل...</div>
        ) : (
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
        )}
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button onClick={handleUpdateUser} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "جارِ الحفظ..." : "حفظ التغييرات"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
